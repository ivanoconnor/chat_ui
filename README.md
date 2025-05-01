# Chat UI

## Project Setup
### 1. Clone the repository
```bash
git clone https://github.com/Astrochamp/chat_ui.git
```
### 2. Set up environment variables
1. Create a `.env` file in the root directory of the project
2. Create the `OPENAI_API_KEY` variable in the `.env` file and set it to your OpenAI API key. You can get your API key from [OpenAI](https://platform.openai.com/).

## Running the project
### Running with Node.js (recommended)
1. Make sure [Node.js](https://nodejs.org/en/) is installed
2. Install the dependencies
```bash
npm install
```
or, if you are using yarn
```bash
yarn install
```
3. Start the development server
```bash
npm run dev
```
or yarn:
```bash
yarn dev
```
4. Open the browser and go to `http://localhost:5173/`
5. To stop the server type `Ctrl+C` in the terminal where the server is running.


### Running with Docker
1. Make sure [Docker Desktop](https://www.docker.com/) is installed
2. Build the image (only run once)
```bash
docker-compose build
```
3. Start the container
```bash
docker-compose up
```
4. Open the browser and go to `http://localhost:5173/`
5. To stop the container type `Ctrl+C` in the terminal where the container is running.
Then run
```bash
docker-compose down
```
You can also use the VSCode Docker extension to manage the container.