# TCC - Trading Card Change | Kit de Logo v4

## 📁 Pastas e arquivos

| Arquivo / Pasta            | Descrição                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `svg/`                     | Vetores em alta qualidade, que podem ser escalados sem perder nitidez. Recomendado para o site e materiais de design. |
| `png/`                     | Imagens com fundo transparente e ícones em diversos tamanhos.                                                         |
| `animacao/`                | Animações prontas para utilização.                                                                                    |
| `favicon.ico`              | Favicon clássico nos tamanhos 16, 32 e 48 px.                                                                         |
| `pagina-kit-completo.html` | Página com o kit completo de logos. Pode ser aberta diretamente no navegador.                                         |

---

## 🎨 Qual usar?

### 🌐 Site — Navbar e Footer

Utilize:

```text
svg/mark-3cartas-*.svg
```

Para o texto **TCC**, utilize a fonte **Cinzel** diretamente no HTML.

---

### ⭐ Favicon e PWA

Para o favicon do site:

```text
favicon.ico
svg/icone-app-favicon.svg
```

Para PWA e dispositivos móveis:

```text
png/icone-192.png
png/icone-512.png
png/apple-touch-icon-180.png
```

---

### 🖼️ Logo grande / Hero

Para áreas de destaque do site:

**Fundo claro:**

```text
svg/mark-5cartas-roxo.svg
```

**Fundo roxo:**

```text
svg/mark-5cartas-branco.svg
```

---

### ✨ Animações no site

Para utilizar diretamente no site:

```text
svg/animado-*.svg
```

Exemplo:

```html
<img src="svg/animado-exemplo.svg" alt="Logo TCC animada">
```

Também podem ser utilizadas as animações:

```text
animacao/*.webp
```

---

### 📱 Redes sociais, e-mail e WhatsApp

Para materiais de redes sociais e compartilhamento:

```text
animacao/*.gif
```

> **Atenção:** os GIFs possuem fundo sólido, podendo ser claro ou roxo. Escolha a versão adequada ao fundo onde será utilizada.

---

## ⚠️ Atenção — Arquivos SVG com texto

Os arquivos:

```text
svg/logo-horizontal-*.svg
```

possuem o texto **"TCC" como texto editável**, utilizando a fonte **Cinzel**.

### Antes de abrir no Figma ou Illustrator

Instale a fonte **Cinzel**, disponível gratuitamente no Google Fonts.

Depois, ao finalizar a edição, converta o texto em curvas:

* **Figma:** `Create outlines`
* **Illustrator:** `Create Outlines`

Isso evita problemas de fonte ao compartilhar o arquivo ou abrir em outro computador.

### Uso direto no navegador

Quando o SVG é aberto diretamente no navegador, a fonte **Cinzel** é carregada automaticamente.

> É necessária uma conexão com a internet para o carregamento automático da fonte.

---

## 🟣 Versões com fundo roxo

As versões identificadas como **`branco`** possuem as cartas preenchidas com roxo.

Utilize essas versões sobre o fundo:

```text
#660366
```

Exemplo:

```text
svg/mark-5cartas-branco.svg
```

---

## 🎨 Identidade visual

### Cores

| Cor                    | Código    | Utilização                          |
| ---------------------- | --------- | ----------------------------------- |
| 🟣 Roxo                | `#660366` | Cor principal da identidade         |
| ⚪ Branco               | `#FFFFFF` | Textos e elementos sobre fundo roxo |
| 🟪 Contorno claro      | `#F0E3F0` | Contornos sobre fundo claro         |
| 🟣 Contorno roxo claro | `#B98FB9` | Contornos sobre fundo roxo          |

### Fontes

| Fonte                 | Utilização                    |
| --------------------- | ----------------------------- |
| **Cinzel**            | Identidade visual e logotipo  |
| **Plus Jakarta Sans** | Interface e textos do sistema |

Ambas as fontes estão disponíveis gratuitamente no **Google Fonts**.