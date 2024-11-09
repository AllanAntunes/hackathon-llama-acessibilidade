# Curador.ia

## Problema
Deficientes visuais rotineiramente se deparam com a falta de acessibilidade em espaços culturais. O termo **"acessibilidade"** não detém-se somente à estrutura física, mas também ao **acesso à informação**.

A *Lei Brasileira de Inclusão* (nº 13.146/2015, também chamada pela sigla LBI) determina:

Art. 42. A pessoa com deficiência tem direito à cultura, ao esporte, ao turismo e ao lazer em **igualdade de oportunidades** com as demais pessoas, sendo-lhe garantido o acesso:
I – a bens culturais em formato acessível;
(...)

Observe este caso: no *Museu da Imagem e do Som* (MIS), em Campinas/SP, há a marcação de chão em partes do espaço, conforme a foto abaixo. Entretanto, como uma pessoa com deficiência visual saberá que há televisores ali?

![Foto de uma exposição de televisores antigos no Museu da Imagem e do Som, em Campinas, SP.](https://github.com/AllanAntunes/hackathon-llama-acessibilidade/blob/main/docs/img/piso_podotatil_2.jpg)

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

### Assistente de voz

* **GET /conversation/start**
Response: 
```json
{
    "sessionId": "string",
    "audioUrl": "string",
    "transcription": "string"
}
```

* **POST /conversation/message**
Request:
```json
{
    "sessionId": "string",
    "audio": "base64"
}
```

Response:
```json
{
    "sessionId": "string",
    "audioUrl": "string",
    "transcription": "string"
}
```

### Painel administrativo

#### Espaços culturais

* **GET /space**
Response:
```json
[
    {
        "spaceId": "string",
        "name": "string",
        "description": "string",
        "thumbnailUrl": "string"
    },
    {
        "spaceId": "string",
        "name": "string",
        "description": "string",
        "thumbnailUrl": "string"
    }
]
```

* **GET /space/:spaceId**
Response:
```json
{
    "spaceId": "string",
    "name": "string",
    "description": "string",
    "thumbnailUrl": "string"
}
```

* **POST /space**
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
    "spaceId": "string"
}
```

* **PUT /space**
Request:
```json
{
    "spaceId": "string",
    "name": "string",
    "description": "string",
    "thumbnailUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "spaceId": "string"
}
```

* **DELETE /space**
Request:
```json
{
    "spaceId": "string"
}
```

Response:
```json
{
    "success": boolean,
    "spaceId": "string"
}
```

#### Items do espaço cultural

* **GET /space/:spaceId/item**
Response:
```json
[
    {
        "itemId": "string",
        "step": integer,
        "name": "string",
        "description": "string",
        "imageUrl": "string"
    },
    {
        "itemId": "string",
        "step": integer,
        "name": "string",
        "description": "string",
        "imageUrl": "string"
    }
]
```

* **GET /space/:spaceId/item/:itemId**
Response:
```json
{
    "itemId": "string",
    "step": integer,
    "name": "string",
    "description": "string",
    "imageUrl": "string"
}
```

* **POST /space/:spaceId/item**
Request:
```json
{
    "name": "string",
    "step": integer,
    "description": "string",
    "imageUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "itemId": "string"
}
```

* **PUT /space/:spaceId/item**
Request:
```json
{
    "itemId": "string",
    "step": integer,
    "name": "string",
    "description": "string",
    "imageUrl": "string"
}
```

Response:
```json
{
    "success": boolean,
    "itemId": "string"
}
```

* **DELETE /space/:spaceId/item**
Request:
```json
{
    "itemId": "string"
}
```

Response:
```json
{
    "success": boolean,
    "itemId": "string"
}
```