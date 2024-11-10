# Curador.ia

## Problema
Deficientes visuais rotineiramente se deparam com a falta de acessibilidade em espaços culturais. O termo **"acessibilidade"** não detém-se somente à estrutura física, mas também ao **acesso à informação**.

A *Lei Brasileira de Inclusão* (nº 13.146/2015, também chamada pela sigla LBI) determina:

Art. 42. A pessoa com deficiência tem direito à cultura, ao esporte, ao turismo e ao lazer em **igualdade de oportunidades** com as demais pessoas, sendo-lhe garantido o acesso:
I – a bens culturais em formato acessível;
(...)

Observe este caso: no *Museu da Imagem e do Som* (MIS), em Campinas/SP, há a marcação de chão em partes do espaço, conforme a foto abaixo. Entretanto, como uma pessoa com deficiência visual saberá que há televisores ali?

![Foto de uma exposição de televisores antigos no Museu da Imagem e do Som, em Campinas, SP.](https://llama-hackathon.s3.us-east-2.amazonaws.com/piso_podotatil_2.jpg)

A princípio, podemos imaginar que um curador deverá estar ao lado do visitante para guiá-lo durante a exploração do espaço cultural. Mas, sem dúvidas, isto reduz a autonomia da pessoa com deficiência. Além disso, nem sempre haverá um colaborador disponível para esta visita guiada.

## Solução
É aqui que a *inteligência artificial* torna-se um elemento-chave. E se criássemos um **curador virtual** que elevasse significativamente o **acesso à informação** da pessoa com deficiência visual?

O **Plano Brasileiro de Inteligência Artificial** tem como uma de suas bases: "Transformar a vida dos brasileiros por meio de inovações sustentáveis e inclusivas baseadas em Inteligência Artificial".

Tendo em vista o costumeiro *orçamento reduzido* dos espaços culturais públicos, nem sempre é possível a implantação de infraestrutura física mais tecnológica, com sensores de proximidade e caixas de som para descrever as obras apresentadas.

Por isto, uma das premissas deste **curador virtual** é promover uma solução *simples*, *barata* e *replicável* para tornar qualquer espaço cultural mais acessível com poucas mudanças físicas. Através de pisos podotáteis, é possível criar um *caminho sequencial* e informar à pessoa com deficiência visual que ela chegou à *próxima obra* ou objeto de interesse e, assim, ela interage com um **assistente de voz** com inteligência artificial de Llama 3.

## Experiência do usuário

### Assistente de voz

### Painel administrativo

## Especificação técnica
O projeto está dividido em dois repositórios: *hackathon-llama-acessibilidade* (você está aqui) para o **front-end** e *hackathon-llama-acessibilidade-backend* (https://github.com/AllanAntunes/hackathon-llama-acessibilidade-backend) para o **back-end**.

O **front-end** utiliza React.js e realiza acesso ao microfone e ao alto-falante do dispositivo para possibilitar a conversa com o curador inteligente.

O **back-end** fornece uma REST API através do framework Flask, escrito em Python.

### 🟢 Assistente de voz

➡️ **GET /conversation/session**
<br>

Response: 
```json
{
    "sessionId": integer
}
```

➡️ **POST /conversation/message**
<br>

Request:
```json
{
    "sessionId": integer,
    "audioUrl": "string",
    "transcription": "string"
}
```

Response:
```json
{
    "sessionId": integer,
    "audioUrl": "string",
    "transcription": "string"
}
```

### 🟢 Painel administrativo

#### 🔵 Espaços culturais

➡️ **GET /space**
<br>

Response:
```json
[
    {
        "spaceId": integer,
        "name": "string",
        "description": "string",
        "thumbnailUrl": "string"
    },
    {
        "spaceId": integer,
        "name": "string",
        "description": "string",
        "thumbnailUrl": "string"
    }
]
```

➡️ **GET /space/:spaceId**
<br>

Response:
```json
{
    "spaceId": integer,
    "name": "string",
    "description": "string",
    "thumbnailUrl": "string"
}
```

➡️ **POST /space**
<br>

Request:
```json
{
    "name": "string",
    "description": "string",
    "thumbnailUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "spaceId": integer
}
```

➡️ **PUT /space**
<br>

Request:
```json
{
    "spaceId": integer,
    "name": "string",
    "description": "string",
    "thumbnailUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "spaceId": integer
}
```

➡️ **DELETE /space**
<br>

Request:
```json
{
    "spaceId": integer
}
```

Response:
```json
{
    "success": boolean,
    "spaceId": integer
}
```

#### 🔵 Items do espaço cultural

➡️ **GET /space/:spaceId/item**
<br>

Response:
```json
[
    {
        "itemId": integer,
        "step": integer,
        "name": "string",
        "description": "string",
        "aiDescription": "string",
        "authorName": "string",
        "authorDescription": "string",
        "imageUrl": "string"
    },
    {
        "itemId": integer,
        "step": integer,
        "name": "string",
        "description": "string",
        "aiDescription": "string",
        "authorName": "string",
        "authorDescription": "string",
        "imageUrl": "string"
    }
]
```

➡️ **GET /space/:spaceId/item/:itemId**
<br>

Response:
```json
{
    "itemId": integer,
    "step": integer,
    "name": "string",
    "description": "string",
    "aiDescription": "string",
    "authorName": "string",
    "authorDescription": "string",
    "imageUrl": "string"
}
```

➡️ **POST /space/:spaceId/item**
<br>

Request:
```json
{
    "name": "string",
    "step": integer,
    "description": "string",
    "authorName": "string",
    "authorDescription": "string",
    "imageUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "itemId": integer
}
```

➡️ **PUT /space/:spaceId/item**
<br>

Request:
```json
{
    "itemId": integer,
    "step": integer,
    "name": "string",
    "description": "string",
    "authorName": "string",
    "authorDescription": "string",
    "imageUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "itemId": integer
}
```

➡️ **DELETE /space/:spaceId/item**
<br>

Request:
```json
{
    "itemId": integer
}
```

Response:
```json
{
    "success": boolean,
    "itemId": integer
}
```