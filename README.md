# sv

## Project Setup
1. Clone the repository
```bash
git clone https://github.com/Astrochamp/chat_ui.git
```
2. Make sure [Docker Desktop](https://www.docker.com/) is installed
3. Build the image (only run once)
```bash
docker-compose build
```
4. Start the container
```bash
docker-compose up
```
5. Open the browser and go to `http://localhost:5173/`
6. To stop the container type `Ctrl+C` in the terminal where the container is running.
Then run
```bash
docker-compose down
```
You can also use the VSCode Docker extension to manage the container.