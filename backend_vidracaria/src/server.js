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


app.post('/orcamentos', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      servico,
      tipoVidro,
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
        servico,
        tipoVidro,
        altura: altura ? parseFloat(altura) : null,
        largura: largura ? parseFloat(largura) : null,
        descricao,
        imagemUrl,
        observacaoAdmin,
        dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
      },
    });


    res.status(201).json(novoOrcamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});


app.put('/orcamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { observacaoAdmin, dataAgendamento, status, valor } = req.body;

  try {
    const valorNumerico = valor
      ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
      : null;

    const atualizado = await prisma.orcamento.update({
      where: { id: parseInt(id) },
      data: {
        observacaoAdmin,
        dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
        status,
        valor: valorNumerico,
      },
    });

    res.json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar orçamento:', err);
    res.status(500).send('Erro ao atualizar orçamento');
  }
});



app.get('/orcamentos', async (req, res) => {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      orderBy: { criadoEm: 'desc' }
    });
    res.json(orcamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar orçamentos' });
  }
});

app.get('/orcamentos/:id/pdf', async (req, res) => {
  const { id } = req.params;

  try {
    const orcamento = await prisma.orcamento.findUnique({ where: { id: parseInt(id) } });
    if (!orcamento) return res.status(404).send('Orçamento não encontrado');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // formato A4 em pontos
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 750;
    const drawText = (text, x = 50, size = 12, gap = 20) => {
      page.drawText(text, { x, y, size, font });
      y -= gap;
    };

    // Cabeçalho
    drawText('Proposta de Orçamento - BM - Vidraçaria', 50, 18, 30);
    // Dados do cliente/serviço
    drawText(`Cliente: ${orcamento.nome}`);
    drawText(`Email: ${orcamento.email}`);
    drawText(`Telefone: ${orcamento.telefone}`);
    drawText(`Serviço: ${orcamento.servico}`);
    drawText(`Tipo de Vidro: ${orcamento.tipoVidro || '-'}`);
    drawText(`Altura: ${orcamento.altura || '-'} cm`);
    drawText(`Largura: ${orcamento.largura || '-'} cm`);
    drawText(`Descrição: ${orcamento.descricao || '-'}`);
    drawText(`Observação: ${orcamento.observacaoAdmin || '-'}`);
    drawText(`Agendamento: ${orcamento.dataAgendamento?.toLocaleDateString('pt-BR') || '-'}`);
    drawText(`Valor:  R$ ${orcamento.valor.toFixed(2) || '-'}`);
    y -= 30; // espaço extra antes do desenho

    // Desenho vetorial
    page.drawText('Desenho ilustrativo:', { x: 50, y, size: 12, font });

    // **CONVERSÃO E ESCALA**
    const CM_TO_PT = 28.35;
    const margin = 50;
    const pageWidth = page.getWidth();

    // 1) converte cm → pt
    let widthPt = (orcamento.largura || 0) * CM_TO_PT;
    let heightPt = (orcamento.altura || 0) * CM_TO_PT;

    // 2) calcula espaço disponível
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = y - margin;        // desde y atual até margem inferior

    // 3) escala se necessário
    const scale = Math.min(
      widthPt > 0 ? maxWidth / widthPt : 1,
      heightPt > 0 ? maxHeight / heightPt : 1,
      1
    );
    widthPt *= scale;
    heightPt *= scale;

    // posição do retângulo logo abaixo do texto “Desenho ilustrativo:”
    const rectX = margin;
    const rectY = y - heightPt - 10;

    // desenha o retângulo (preenchido opcionalmente)
    page.drawRectangle({
      x: rectX,
      y: rectY,
      width: widthPt,
      height: heightPt,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      fillColor: rgb(0.95, 0.95, 0.95), // opcional
    });

    // Linha de dimensão horizontal (largura)
    const dimHY = rectY - 10;
    page.drawLine({
      start: { x: rectX, y: dimHY },
      end: { x: rectX + widthPt, y: dimHY },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    // “Tiques” nas extremidades
    page.drawLine({ start: { x: rectX, y: dimHY + 5 }, end: { x: rectX, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: rectX + widthPt, y: dimHY + 5 }, end: { x: rectX + widthPt, y: dimHY - 5 }, thickness: 0.8, color: rgb(0, 0, 0) });
    // Texto da largura
    page.drawText(`${orcamento.largura} cm`, {
      x: rectX + widthPt / 2 - 15,
      y: dimHY - 15,
      size: 10,
      font,
    });

    // Linha de dimensão vertical (altura)
    const dimVX = rectX - 10;
    page.drawLine({
      start: { x: dimVX, y: rectY },
      end: { x: dimVX, y: rectY + heightPt },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
    // Tiques
    page.drawLine({ start: { x: dimVX + 5, y: rectY }, end: { x: dimVX - 5, y: rectY }, thickness: 0.8, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: dimVX + 5, y: rectY + heightPt }, end: { x: dimVX - 5, y: rectY + heightPt }, thickness: 0.8, color: rgb(0, 0, 0) });
    // Texto da altura, rotacionado 90°
    page.drawText(`${orcamento.altura} cm`, {
      x: dimVX - 20,
      y: rectY + heightPt / 2 + 5,
      size: 10,
      font,
      rotate: degrees(-90),
    });

    // Ajusta y para continuar o restante do PDF
    y = rectY - 40;

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orcamento_${id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar PDF');
  }
});


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
app.post('/servicos', async (req, res) => {
  const { titulo, descricao, icone } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
  }

  try {
    const novo = await prisma.servico.create({
      data: { titulo, descricao, icone }
    });

    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /servicos/:id (editar)
app.put('/servicos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, icone, ativo } = req.body;

  try {
    const servico = await prisma.servico.update({
      where: { id: parseInt(id) },
      data: { titulo, descricao, icone, ativo }
    });

    res.json(servico);
  } catch (err) {
    console.error('Erro ao atualizar serviço:', err);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

app.delete('/servicos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.servico.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ mensagem: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir serviço:', err);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

/* SERVIÇOS */


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
