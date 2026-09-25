# Como Gerar e Instalar o Executável TIKBLOX (.exe) no Windows

Este guia ensina como compilar o instalador oficial do **TIKBLOX** para Windows (`TIKBLOX-Setup.exe`) e rodar no seu computador com 1 clique.

---

### Passo 1: Baixar o Código do Projeto

1. No menu superior direito do Google AI Studio, clique nos **três pontinhos (...)** ou em **Export / Download as ZIP**.
2. Descompacte a pasta no seu computador (ex: na sua área de trabalho ou pasta Documentos).

---

### Passo 2: Instalar o Electron e Gerar o Executável

Abra o terminal (Prompt de Comando ou PowerShell) dentro da pasta descompactada e rode:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Instalar o Electron Packager (ferramenta que gera o .exe)
npm install --save-dev electron electron-builder

# 3. Gerar a compilação do React
npm run build

# 4. Gerar o instalador .exe do Windows
npx electron-builder --win nsis:ia32,x64
```

---

### Passo 3: Onde fica o arquivo `.exe` gerado?

Assim que o comando terminar, será criada uma pasta chamada `dist/` no seu projeto contendo:
- 📁 `dist/TIKBLOX Setup 1.0.0.exe` (Instalador completo do Windows com ícone oficial)
- 📁 `dist/win-unpacked/` (Versão portátil para rodar direto sem precisar instalar)

---

### Passo 4: Instalar no Windows

1. Dê **dois cliques** no arquivo `TIKBLOX Setup 1.0.0.exe`.
2. O instalador do Windows criará o atalho na sua **Área de Trabalho** e no **Menu Iniciar**.
3. Abra o TIKBLOX como qualquer software profissional (Word, Excel, Photoshop) e use a mineração em tempo real sem depender de abas de navegador!
