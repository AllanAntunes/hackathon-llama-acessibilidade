# Curador.ia
![Logomarca do projeto Curador.ia](https://llama-hackathon.s3.us-east-2.amazonaws.com/curadorIA+(1).png)

## Social Barrier
Visually impaired individuals routinely encounter a lack of accessibility in cultural spaces. The term **"accessibility"** not only refers to physical structure but also to **access to information**.

The *Brazilian Inclusion Law* (No. 13,146/2015, also known by the acronym LBI) stipulates:

Art. 42. People with disabilities have the right to culture, sports, tourism, and leisure on an **equal basis with others**, with guaranteed access to:
I – cultural assets in an accessible format;
(...)

Consider this example: at the *Museum of Image and Sound* (MIS) in Campinas, São Paulo, there is floor marking in parts of the space, as shown in the photo below. However, how will a visually impaired person know there are televisions there?

![Picture from an exposition showing old television models at Museu da Imagem e do Som (Campinas, São Paulo)](https://llama-hackathon.s3.us-east-2.amazonaws.com/piso_podotatil_2.jpg)

At first, we might imagine that a curator would need to be alongside the visitor to guide them during the exploration of the cultural space. However, this undoubtedly reduces the autonomy of the person with a disability. Additionally, there will not always be a staff member available for such guided visits.

## Resolution
This is where *artificial intelligence* becomes a key element. What if we created a **virtual curator** that could significantly enhance **access to information** for visually impaired individuals?

The **Brazilian Artificial Intelligence Plan** has as one of its foundations: "Transforming the lives of Brazilians through sustainable and inclusive innovations based on Artificial Intelligence".

Given the typically *limited budgets* of public cultural spaces, it is not always feasible to implement more advanced physical infrastructure, such as proximity sensors and speakers to describe the exhibits.

For this reason, one of the premises of this **virtual curator** is to provide a *simple*, *affordable*, and *replicable* solution to make any cultural space more accessible with minimal physical changes. By using tactile flooring, it’s possible to create a *sequential path*, informing the visually impaired person that they have reached the *next exhibit* or object of interest, and allowing them to interact with a *voice assistant* powered by Llama 3 artificial intelligence.

## User Experience

### Voice Assistant
https://acessibilidade.tec.br/

![Voice Assistant](https://llama-hackathon.s3.us-east-2.amazonaws.com/Screenshot+2024-11-10+at+10.13.33.png)

### Administrative Panel
https://acessibilidade.tec.br/admin/spaces/

![Administrative Panel](https://llama-hackathon.s3.us-east-2.amazonaws.com/Screenshot+2024-11-10+at+10.11.40.png)

## Technical Specification
The project is divided into two repositories: *hackathon-llama-acessibilidade* (you are here) for the **front end** and *hackathon-llama-acessibilidade-backend* (https://github.com/AllanAntunes/hackathon-llama-acessibilidade-backend) for the **back end**.

The **front end** uses Next.js and accesses the device's microphone and speaker to enable interaction with the intelligent curator.

The **back end** provides a REST API via the Flask framework, written in Python.

![Architecture Schema](https://llama-hackathon.s3.us-east-2.amazonaws.com/image.png)

### 🟢 Voice Assistant

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

Request (form-data):
| Field      | Type   |
|------------|--------|
| sessionId  | string |
| spaceId    | string |
| audioFile  | file   |

Response:
```json
{
    "sessionId": integer,
    "audioUrl": "string",
    "transcription": "string"
}
```

### 🟢 Administrative Panel

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

#### 🔵 Cultural space items

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