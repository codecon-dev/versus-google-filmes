# Mecanismo de Busca de Filmes

> *Repositório oficial do Versus Codecon: três devs, o mesmo dataset, abordagens completamente diferentes*

## Sobre o Desafio

Este repositório contém os projetos desenvolvidos durante o desafio Versus, onde desenvolvedores tiveram **2 horas** para criar um mecanismo de busca funcional a partir de um dataset do TMDB com **5.000 filmes**.

O desafio é simples de enunciar e difícil de executar: dado um dataset com título, gênero, sinopse, nota, popularidade e data de lançamento, criar uma busca inteligente que retorne resultados relevantes para queries de complexidade variada.

## Sobre o Desafio

Construir um mecanismo de busca com interface funcional que:
- Carregue e indexe o dataset de 5.000 filmes do TMDB
- Suporte buscas por título, gênero, sinopse e outros metadados
- Retorne resultados relevantes para queries simples e compostas
- Tenha interface funcional para interação com a busca

## Regras do Desafio

### Limitações
- ⏱️ **2 horas** para desenvolvimento
- 🛠️ Qualquer linguagem ou stack
- 🤖 IA liberada para consulta e desenvolvimento
- 🎯 A busca precisa ser inteligente de verdade — não apenas correspondência exata

### Critérios de Avaliação
- Relevância dos resultados para queries simples (`Inception`)
- Suporte a buscas por atributos (`filmes de terror dos anos 80`)
- Queries compostas (`drama com final triste`)
- Filtros por metadados (`sci-fi com rating acima de 8`)
- Busca por similaridade (`filmes parecidos com Interstellar`)

## Participe Você Também!

**Acha que consegue criar uma busca mais precisa?** Adoraríamos ver sua abordagem! 🔍

### Como Contribuir

1. **Fork** este repositório
2. Crie uma pasta com seu nome/username dentro da estrutura
3. Desenvolva seu mecanismo de busca
4. Adicione um README.md explicando sua abordagem
5. Abra um **Pull Request** com suas contribuições

### Template de Documentação

Seu README deve incluir:
- **Stack**: Tecnologias e bibliotecas utilizadas
- **Abordagem de Busca**: Como você implementou a indexação e relevância?
- **Resultado**: Screenshots ou demo
- **Aprendizados**: O que funcionou? O que mudaria?

### Regras para Contribuição

- ✅ Use qualquer stack que preferir (React, Vue, Next.js, Python, etc.)
- ✅ Documente bem sua abordagem de busca no README
- ✅ Mantenha o código limpo e comentado
- ✅ A busca precisa funcionar de verdade para queries compostas
- ❌ Nada de código malicioso

### Ideias de Abordagem

- 🔎 Busca por índice invertido
- 🧠 Embeddings e busca semântica
- 📊 TF-IDF para relevância
- 🔗 Full-text search com banco de dados
- ⚡ Fuzzy matching para tolerância a erros
- 🎯 Filtros combinados por metadados

## 📁 Estrutura do Repositório

```
/
├── seu-nome-aqui/        # 👈 Sua contribuição!
│   ├── src/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── script.js
│   │   └── ...
│   ├── package.json      # Se aplicável
│   └── README.md         # Descreva sua abordagem aqui!
└── README.md
```

## Dataset

O dataset utilizado é o TMDB Top 5000 Movies, com os seguintes campos:

- `title` — Título do filme
- `genres` — Gêneros
- `overview` — Sinopse
- `vote_average` — Nota média
- `popularity` — Índice de popularidade
- `release_date` — Data de lançamento

[Faça o downlod aqui](https://drive.google.com/file/d/1cUblEE33AEeHHe4bQZFR8xFJ7qRO-tpb/view?usp=sharing)

## Como Executar os Projetos

Cada projeto possui suas próprias instruções de execução. Navegue até a pasta do participante desejado para encontrar o README específico com instruções detalhadas.

## 🤝 Apoie a Codecon

Gostou do conteúdo? Apoie nossos projetos!

**Codecon PRO** - Apenas R$ 15/mês
- Crachá especial na Codecon Summit
- Acesso ao nosso grupo secreto no WhatsApp ou Discord
- Acompanhe os bastidores: planejamento, ideias e conversas de quem constrói junto
- Receba nossa newsletter todas as semanas
- Acesso ao tema da Codecon para VSCode

[Saiba mais sobre a Codecon PRO](https://codecon.dev/pro)

## 📱 Siga a Codecon

- [Instagram](https://instagram.com/codecondev)
- [YouTube](https://youtube.com/codecondev)
- [Site Oficial](https://codecon.dev)

## 📄 Licença

Este projeto está sob licença MIT. Sinta-se livre para explorar, aprender e compartilhar!

---

*Feito com 🔍 pela comunidade Codecon*
