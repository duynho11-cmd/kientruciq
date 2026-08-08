import express from "express"

const app = express();

app.listen(5001, () => {
    console.log("server bat dau tren cong 5001");

});

app.get("/api/tasks", (request, response) => {
    response.status(200).send("ban co 10 viec can lam");
});