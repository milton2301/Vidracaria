// server.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enviarEmail } from './utils/emailService.js';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Caminho da pasta de uploads
const pastaUploads = path.join('uploads');

// Cria a pasta se não existir
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },
  filename: (req, file, cb) => {
    const nomeUnico = `${Date.now()}-${file.originalname}`;
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage });

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-super-seguro';

const app = express();
const prisma = new PrismaClient();

// Cria a pasta /uploads se não existir
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Vidraçaria rodando!');
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta' });

    if (!usuario.ativo) {
      return res.status(403).json({ error: 'Usuário desativado' });
    }

    if (usuario.bloqueado) {
      return res.status(403).json({ error: 'Usuário bloqueado' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      precisaTrocarSenha: usuario.precisaTrocarSenha,
      nome: usuario.nome,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no login' });
  }
});

app.post('/usuarios', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    const senhaGerada = 'Senha@123';
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        precisaTrocarSenha: true,
      },
    });

    // Enviar e-mail
    await enviarEmail({
      to: email,
      subject: 'Acesso ao Sistema - Vidraçaria',
      html: `
        <p>Olá <strong>${nome}</strong>,</p>
        <p>Seu usuário foi cadastrado no sistema da vidraçaria.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Senha:</strong> Senha@123</p>
        <p><em>Por segurança, você deverá alterar a senha no primeiro acesso.</em></p>
      `
    });


    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

app.put('/trocar-senha', async (req, res) => {
  const authHeader = req.headers.authorization;
  const senhaNova = req.body.senhaNova;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não enviado' });

  const token = authHeader.split(' ')[1];

  // 🔐 Validação de força da senha
  if (!senhaNova || senhaNova.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  if (!/[A-Za-z]/.test(senhaNova) || !/\d/.test(senhaNova)) {
    return res.status(400).json({ error: 'A senha deve conter pelo menos uma letra e um número.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const senhaCriptografada = await bcrypt.hash(senhaNova, 10);

    await prisma.usuario.update({
      where: { id: decoded.id },
      data: {
        senha: senhaCriptografada,
        precisaTrocarSenha: false,
      },
    });

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// GET todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        bloqueado: true,
      }
    });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// PUT para atualizar ativo/bloqueado
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { ativo, bloqueado } = req.body;

  try {
    const data = {};
    if (ativo !== undefined) data.ativo = ativo;
    if (bloqueado !== undefined) data.bloqueado = bloqueado;

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

/*ORÇAMENTOS */
app.post('/orcamentos', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      servicoId,
      tipoVidroId,
      altura,
      largura,
      descricao,
      imagemUrl,
      observacaoAdmin,
      dataAgendamento
    } = req.body;

    const novoOrcamento = await prisma.orcamento.create({
      data: {
        nome,
        email,
        telefone,
        servicoId: parseInt(servicoId),
        tipoVidroId: tipoVidroId ? parseInt(tipoVidroId) : null,
        altura: altura ? parseFloat(altura) : null,
        largura: largura ? parseFloat(largura) : null,
        descricao,
        imagemUrl,
        observacaoAdmin,
        dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
      },
      include: { servico: true, tipoVidro: true }
    });

    res.status(201).json(novoOrcamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});


app.put('/orcamentos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    observacaoAdmin,
    dataAgendamento,
    status,
    valor,
  } = req.body;

  try {
    // Conversão segura do valor (caso venha string formatada)
    const valorNumerico = typeof valor === 'string'
      ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
      : valor;

    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: parseInt(id) },
      data: {
        observacaoAdmin: observacaoAdmin || null,
        dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
        status,
        valor: valorNumerico || null,
      },
    });

    res.status(200).json(orcamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});


app.get('/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        servico: true,
        proposta: true,
        tipoVidro: true
      },
    });
    res.json(orcamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

app.get('/orcamentos/:id/pdf', async (req, res) => {
  const { id } = req.params;

  try {
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: parseInt(id) },
      include: { servico: true, proposta: true, tipoVidro: true }
    });
    if (!orcamento) return res.status(404).send('Orçamento não encontrado');


    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 750;
    const drawText = (text, x = 50, size = 12, gap = 20) => {
      page.drawText(text, { x, y, size, font });
      y -= gap;
    };

    // Cabeçalho
    drawText('Proposta de Orçamento - BM - Vidraçaria', 50, 18, 30);
    drawText(`Cliente: ${orcamento.nome}`);
    drawText(`Email: ${orcamento.email}`);
    drawText(`Telefone: ${orcamento.telefone}`);
    drawText(`Serviço: ${orcamento.servico?.titulo || '-'}`);
    drawText(`Tipo de Vidro: ${orcamento.tipoVidro.nome || '-'}`);
    drawText(`Altura: ${orcamento.altura || '-'} cm`);
    drawText(`Largura: ${orcamento.largura || '-'} cm`);
    drawText(`Descrição: ${orcamento.descricao || '-'}`);
    drawText(`Observação: ${orcamento.observacaoAdmin || '-'}`);
    drawText(`Agendamento: ${orcamento.dataAgendamento?.toLocaleDateString('pt-BR') || '-'}`);
    drawText(`Valor:  R$ ${orcamento.valor != null ? orcamento.valor.toFixed(2) : '-'}`);
    y -= 30;

    // Desenho ilustrativo
    page.drawText('Desenho ilustrativo:', { x: 50, y, size: 12, font });

    const margin = 50;
    const visualWidth = 300;
    const visualHeight = 300;

    const rectX = margin;
    const rectY = y - visualHeight - 10;

    if (orcamento.servico?.imagem) {
      const caminhoImagem = path.join('uploads', orcamento.servico.imagem);
      if (fs.existsSync(caminhoImagem)) {
        const imageBytes = fs.readFileSync(caminhoImagem);
        const imageEmbed = await pdfDoc.embedJpg(imageBytes).catch(() => pdfDoc.embedPng(imageBytes));
        const image = await imageEmbed;

        page.drawImage(image, {
          x: rectX,
          y: rectY,
          width: visualWidth,
          height: visualHeight,
        });
      } else {
        page.drawText('[Imagem não encontrada]', {
          x: rectX,
          y: rectY + visualHeight / 2,
          size: 10,
          font,
        });
      }
    } else {
      page.drawRectangle({
        x: rectX,
        y: rectY,
        width: visualWidth,
        height: visualHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        fillColor: rgb(0.95, 0.95, 0.95),
      });
    }

    // Linha horizontal (largura)
    const dimHY = rectY - 10;
    page.drawLine({
      start: { x: rectX, y: dimHY },
      end: { x: rectX + visualWidth, y: dimHY },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    page.drawLine({ start: { x: rectX, y: dimHY + 5 }, end: { x: rectX, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: rectX + visualWidth, y: dimHY + 5 }, end: { x: rectX + visualWidth, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawText(`${orcamento.largura || 0} cm`, {
      x: rectX + visualWidth / 2 - 15,
      y: dimHY - 15,
      size: 10,
      font,
    });

    // Linha de dimensão vertical (altura)
    const dimVX = rectX - 10;
    page.drawLine({
      start: { x: dimVX, y: rectY },
      end: { x: dimVX, y: rectY + visualHeight },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    page.drawLine({ start: { x: dimVX + 5, y: rectY }, end: { x: dimVX - 5, y: rectY }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: dimVX + 5, y: rectY + visualHeight }, end: { x: dimVX - 5, y: rectY + visualHeight }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawText(`${orcamento.altura || 0} cm`, {
      x: dimVX - 20,
      y: rectY + visualHeight / 2 + 5,
      size: 10,
      font,
      rotate: degrees(-90),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orcamento_${id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF');
  }
});

/*ORÇAMENTOS */


/*PROPOSTAS */
app.get('/propostas/:orcamentoId', async (req, res) => {
  const { orcamentoId } = req.params;

  try {
    const propostas = await prisma.proposta.findMany({
      where: {
        orcamentoId: parseInt(orcamentoId),
      },
      include: {
        servico: true,
        tipoVidro: true,
      },
      orderBy: {
        dataCriacao: 'desc',
      },
    });

    res.json(propostas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar propostas por orçamento' });
  }
});

app.post('/propostas', async (req, res) => {
  const {
    orcamentoId, servicoId, tipoVidroId, altura, largura,
    descricao, observacaoAdmin, valor
  } = req.body;

  try {
    const nova = await prisma.proposta.create({
      data: {
        orcamentoId,
        servicoId: parseInt(servicoId),
        tipoVidroId: tipoVidroId ? parseInt(tipoVidroId) : null,
        altura,
        largura,
        descricao,
        observacaoAdmin,
        valor,
      },
      include: { servico: true, tipoVidro: true }
    });
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar proposta' });
  }
});

// Atualizar uma proposta existente
app.put('/propostas/:id', async (req, res) => {
  const { id } = req.params;
  const { observacaoAdmin, valor } = req.body;

  try {
    const propostaAtualizada = await prisma.proposta.update({
      where: { id: parseInt(id) },
      data: {
        observacaoAdmin,
        valor
      },
      include: { servico: true, tipoVidro: true }
    });

    res.json(propostaAtualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar proposta' });
  }
});

// DELETE proposta
app.delete('/propostas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const proposta = await prisma.proposta.findUnique({
      where: { id: parseInt(id) },
    });

    if (!proposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    await prisma.proposta.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar proposta' });
  }
});

// GET gerar PDF da proposta
app.get('/propostas/:id/pdf', async (req, res) => {
  const { id } = req.params;

  try {
    const proposta = await prisma.proposta.findUnique({
      where: { id: parseInt(id) },
      include: { servico: true, orcamento: true, tipoVidro: true }
    });

    if (!proposta) return res.status(404).send('Proposta não encontrada');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = 780;

    const drawText = (text, x = 50, size = 12, gap = 20) => {
      page.drawText(text, { x, y, size, font });
      y -= gap;
    };

    drawText('Proposta Detalhada - Vidraçaria', 50, 18, 30);
    drawText(`Cliente: ${proposta.orcamento.nome}`);
    drawText(`Email: ${proposta.orcamento.email}`);
    drawText(`Telefone: ${proposta.orcamento.telefone}`);
    drawText(`Serviço: ${proposta.servico.titulo}`);
    drawText(`Tipo de Vidro: ${proposta.tipoVidro.nome || '-'}`);
    drawText(`Altura: ${proposta.altura || '-'} cm`);
    drawText(`Largura: ${proposta.largura || '-'} cm`);
    drawText(`Descrição: ${proposta.descricao || '-'}`);
    drawText(`Observação: ${proposta.observacaoAdmin || '-'}`);
    drawText(`Valor: R$ ${proposta.valor?.toFixed(2) || '-'}`);
    y -= 30;

    // Desenho ilustrativo
    page.drawText('Desenho ilustrativo:', { x: 50, y, size: 12, font });

    const margin = 50;
    const visualWidth = 300;
    const visualHeight = 300;

    const rectX = margin;
    const rectY = y - visualHeight - 10;

    if (proposta.servico?.imagem) {
      const caminhoImagem = path.join('uploads', proposta.servico.imagem);
      if (fs.existsSync(caminhoImagem)) {
        const imageBytes = fs.readFileSync(caminhoImagem);
        const imageEmbed = await pdfDoc.embedJpg(imageBytes).catch(() => pdfDoc.embedPng(imageBytes));
        const image = await imageEmbed;

        page.drawImage(image, {
          x: rectX,
          y: rectY,
          width: visualWidth,
          height: visualHeight,
        });
      } else {
        page.drawText('[Imagem não encontrada]', {
          x: rectX,
          y: rectY + visualHeight / 2,
          size: 10,
          font,
        });
      }
    } else {
      page.drawRectangle({
        x: rectX,
        y: rectY,
        width: visualWidth,
        height: visualHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        fillColor: rgb(0.95, 0.95, 0.95),
      });
    }

    // Linha horizontal (largura)
    const dimHY = rectY - 10;
    page.drawLine({
      start: { x: rectX, y: dimHY },
      end: { x: rectX + visualWidth, y: dimHY },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    page.drawLine({ start: { x: rectX, y: dimHY + 5 }, end: { x: rectX, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: rectX + visualWidth, y: dimHY + 5 }, end: { x: rectX + visualWidth, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawText(`${proposta.largura || 0} cm`, {
      x: rectX + visualWidth / 2 - 15,
      y: dimHY - 15,
      size: 10,
      font,
    });

    // Linha de dimensão vertical (altura)
    const dimVX = rectX - 10;
    page.drawLine({
      start: { x: dimVX, y: rectY },
      end: { x: dimVX, y: rectY + visualHeight },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    page.drawLine({ start: { x: dimVX + 5, y: rectY }, end: { x: dimVX - 5, y: rectY }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: dimVX + 5, y: rectY + visualHeight }, end: { x: dimVX - 5, y: rectY + visualHeight }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawText(`${proposta.altura || 0} cm`, {
      x: dimVX - 20,
      y: rectY + visualHeight / 2 + 5,
      size: 10,
      font,
      rotate: degrees(-90),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposta_${id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF da proposta');
  }
});

/*PROPOSTAS */

/*TRATAMENTO DAS IMAGENS */
app.post('/imagens', upload.single('imagem'), async (req, res) => {
  const { tipo, descricao } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo de imagem é obrigatório.' });
  }

  try {
    const novaImagem = await prisma.imagem.create({
      data: {
        tipo,
        descricao,
        caminho: req.file.filename
      }
    });

    res.status(201).json(novaImagem);
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    res.status(500).json({ error: 'Erro ao salvar imagem' });
  }
});

// GET /imagens
app.get('/imagens', async (req, res) => {
  try {
    const imagens = await prisma.imagem.findMany({ orderBy: { id: 'desc' } });
    res.json(imagens);
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

// DELETE /imagens/:id
app.delete('/imagens/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const imagem = await prisma.imagem.findUnique({ where: { id } });

    if (!imagem) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Remover arquivo físico
    const caminhoFisico = path.join('uploads', imagem.caminho);
    if (fs.existsSync(caminhoFisico)) {
      fs.unlinkSync(caminhoFisico);
    }

    // Remover registro do banco
    await prisma.imagem.delete({ where: { id } });

    res.status(200).json({ mensagem: 'Imagem removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({ error: 'Erro ao remover imagem' });
  }
});

/*TRATAMENTO DAS IMAGENS */

/* SERVIÇOS */
// GET /servicos
app.get('/servicos', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { id: 'desc' },
    });
    res.json(servicos);
  } catch (err) {
    console.error('Erro ao buscar serviços:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /servicos
app.post('/servicos', upload.single('imagem'), async (req, res) => {
  const { titulo, descricao, icone, ativo } = req.body;

  try {
    const novoServico = await prisma.servico.create({
      data: {
        titulo,
        descricao,
        icone,
        ativo: ativo === 'false' ? false : true,
        imagem: req.file?.filename || null, // só salva o nome do arquivo
      },
    });

    res.status(201).json(novoServico);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});


// PUT /servicos/:id (editar)
app.put('/servicos/:id', upload.single('imagem'), async (req, res) => {
  const { titulo, descricao, icone, ativo } = req.body;
  const { id } = req.params;

  try {
    const servicoAtual = await prisma.servico.findUnique({
      where: { id: parseInt(id) },
    });

    // Remove a imagem anterior se uma nova for enviada
    if (req.file && servicoAtual.imagem) {
      const caminhoAntigo = path.join('uploads', servicoAtual.imagem);
      if (fs.existsSync(caminhoAntigo)) {
        fs.unlinkSync(caminhoAntigo);
      }
    }

    const data = {
      titulo,
      descricao,
      icone,
      ativo: ativo === 'false' ? false : true,
    };

    if (req.file) {
      data.imagem = req.file.filename;
    }

    const atualizado = await prisma.servico.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});


app.delete('/servicos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Busca o serviço para pegar a imagem antiga
    const servico = await prisma.servico.findUnique({
      where: { id: parseInt(id) },
    });

    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Remove a imagem física se existir
    if (servico.imagem) {
      const caminhoImagem = path.join('uploads', servico.imagem);
      if (fs.existsSync(caminhoImagem)) {
        fs.unlinkSync(caminhoImagem);
      }
    }

    // Remove o registro do banco
    await prisma.servico.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir serviço:', err);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

/* SERVIÇOS */

/*TIPO DE VIDROS */
// Listar todos os tipos de vidro
app.get('/tiposvidro', async (req, res) => {
  try {
    const lista = await prisma.tipoVidro.findMany();
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tipos de vidro' });
  }
});

// Buscar tipo de vidro por ID
app.get('/tiposvidro/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tipo = await prisma.tipoVidro.findUnique({
      where: { id: parseInt(id) },
    });

    if (!tipo) return res.status(404).json({ error: 'Tipo de vidro não encontrado' });

    res.json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tipo de vidro' });
  }
});

// Criar novo tipo de vidro
app.post('/tiposvidro', async (req, res) => {
  const { nome, descricao, valorM2 } = req.body;

  try {
    const novo = await prisma.tipoVidro.create({
      data: {
        nome,
        descricao,
        valorM2: parseFloat(valorM2),
      },
    });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tipo de vidro' });
  }
});

// Atualizar tipo de vidro
app.put('/tiposvidro/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, valorM2 } = req.body;

  try {
    const atualizado = await prisma.tipoVidro.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        descricao,
        valorM2: parseFloat(valorM2),
      },
    });
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tipo de vidro' });
  }
});

// Deletar tipo de vidro
app.delete('/tiposvidro/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tipoVidro.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar tipo de vidro' });
  }
});

/*TIPO DE VIDROS */

/*CONFIGURAÇÕES DO TEXTO*/
// GET todas as configurações
app.get('/configuracoes', async (req, res) => {
  try {
    const dados = await prisma.configuracaoSite.findMany();
    res.json(dados);
  } catch (err) {
    console.error('Erro ao buscar configurações:', err);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// GET configuração por chave
app.get('/configuracoes/:chave', async (req, res) => {
  const { chave } = req.params;
  try {
    const config = await prisma.configuracaoSite.findUnique({ where: { chave } });
    res.json(config);
  } catch (err) {
    console.error('Erro ao buscar configuração:', err);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// POST cria ou atualiza configuração
app.post('/configuracoes', async (req, res) => {
  const { chave, titulo, subtitulo, texto } = req.body;

  try {
    const existente = await prisma.configuracaoSite.findUnique({ where: { chave } });

    if (existente) {
      const atualizado = await prisma.configuracaoSite.update({
        where: { chave },
        data: {
          titulo,
          subtitulo,
          texto,
          atualizado_em: new Date(),
        },
      });
      res.json(atualizado);
    } else {
      const novo = await prisma.configuracaoSite.create({
        data: {
          chave,
          titulo,
          subtitulo,
          texto,
        },
      });
      res.status(201).json(novo);
    }
  } catch (err) {
    console.error('Erro ao salvar configuração:', err);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
});

/*CONFIGURAÇÕES DO TEXTO*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
