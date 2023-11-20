import express from "express";
import bodyParser from "body-parser";
import { randomUUID } from "crypto";
import cors from "cors";
import "dotenv/config";
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const chats = [
  {
    id: "a1",
    conversations: [
      {
        id: "b1",
        isAiReply: false,
        message: "Hello",
      },
      {
        id: "b2",
        isAiReply: true,
        message: "Hello How are you",
        isFeedbackNegative: false,
      },
    ],
    rating: 5,
    subjectiveFeedback: "Great model",
  },
  {
    id: "a2",
    conversations: [
      {
        id: "b3",
        isAiReply: false,
        message: "Yo Yo Yo ",
      },
      {
        id: "b4",
        isAiReply: true,
        message: "how is it going?",
        isFeedbackNegative: null,
      },
    ],
    rating: 4,
    subjectiveFeedback: "Good model",
  },
  {
    id: "a3",
    conversations: [
      {
        id: "b5",
        isAiReply: false,
        message: "Hi Hellow How are you",
      },
      {
        id: "b6",
        isAiReply: true,
        message: "I am fine thank you",
        isFeedbackNegative: null,
      },
    ],
    rating: -1,
    subjectiveFeedback: "Okayish",
  },
];

const aiReplies = [
  "Hello",
  "Hi I am Sould AI",
  "This is how its done, so ....",
  "Could you please repeat the question???...",
  "I am really depressed with india's defeat in the WC 2023, please try again in some days, would be happy to help",
  "Technically we do it like this",
];

function getAiReply() {
  return aiReplies[Math.floor(Math.random() * aiReplies.length)];
}

app.get("/healthcheck", (req, res) => {
  res.json({ message: "lub dub" });
});

app.get("/history", async (req, res) => {
  let response;
  try {
    response = {
      data: chats.length > 0 ? chats : [],
    };
    res.send(response);
  } catch (error) {
    response = error;
    res.status(400).json(response);
  }
});

app.get("/chatHistory/:id", (req, res) => {
  let response;
  const chatId = req.params.id;
  try {
    const requiredChat = chats.find((el) => el.id == chatId);
    response = {
      data: requiredChat ? requiredChat : {},
    };
    res.send(response);
  } catch (error) {
    response = error;
    res.status(400).json(response);
  }
});

app.post("/message", (req, res) => {
  let response;
  try {
    const chatId = req.body.chatId;
    const userMessage = {
      id: req.body.id,
      isAiReply: false,
      message: req.body.message,
    };
    const replyResponse = {
      id: randomUUID(),
      isAiReply: true,
      message: getAiReply(),
      isFeedbackNegative: null,
    };
    if (chatId) {
      const requiredChatIndex = chats.findIndex((el) => el.id == chatId);
      if (requiredChatIndex >= 0) {
        chats[requiredChatIndex].conversations.push(userMessage);
        chats[requiredChatIndex].conversations.push(replyResponse);
      }
      response = {
        data: replyResponse,
      };
    } else {
      const newChat = {
        id: randomUUID(),
        conversations: [userMessage, replyResponse],
        rating: 0,
        subjectiveFeedback: "",
      };
      chats.push(newChat);
      response = {
        chatId: newChat.id,
        data: replyResponse,
      };
    }
    res.send(response);
  } catch (error) {
    response = error;
    res.status(400).json(response);
  }
});

app.patch("/message", (req, res) => {
  let response;
  const chatId = req.body.chatId;
  const conversationId = req.body.conversationId;
  const feedBack = req.body.feedBack;
  try {
    const requiredChatIndex = chats.findIndex((el) => el.id == chatId);
    if (requiredChatIndex >= 0) {
      const requiredConverdsationId = chats[
        requiredChatIndex
      ].conversations.findIndex((el) => el.id == conversationId);
      if (
        requiredConverdsationId >= 0 &&
        chats[requiredChatIndex].conversations[requiredConverdsationId]
          .isAiReply
      ) {
        chats[requiredChatIndex].conversations[
          requiredConverdsationId
        ].isFeedbackNegative = feedBack;
      }
    }
    response = {
      data: feedBack,
    };
    res.send(response);
  } catch (error) {
    response = error;
    res.status(400).json(response);
  }
});

app.post("/feedback", (req, res) => {
  let response;
  try {
    const chatId = req.body.chatId;
    const rating = req.body.rating;
    const subjectiveFeedback = req.body.subjectiveFeedback;
    const requiredChatIndex = chats.findIndex((el) => el.id == chatId);
    if (requiredChatIndex >= 0) {
      chats[requiredChatIndex].rating = rating;
      chats[requiredChatIndex].subjectiveFeedback = subjectiveFeedback;
    }
    response = {
      data: chats[requiredChatIndex],
    };
    res.send(response);
  } catch (error) {
    response = error;
    res.status(400).json(response);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
