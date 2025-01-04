async function loadRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const repos = await response.json();
        const repoList = document.getElementById('repo-list');
        repoList.innerHTML = ''; // Очищаем список перед добавлением новых элементов

        repos.forEach(repo => {

            // Создаём элементы для каждого репозитория
            const contextDiv = document.createElement('div');
            contextDiv.className = 'context';

            // Создаём контейнер для текста
            const contextTextDiv = document.createElement('div');
            contextTextDiv.className = 'context_text';

            // Название репозитория
            const titleDiv = document.createElement('div');
            titleDiv.className = 'context_title';
            const repoLink = document.createElement('a');
            repoLink.className = 'context_title';
            repoLink.href = repo.html_url;
            repoLink.textContent = repo.name;
            repoLink.target = '_blank'; // Открывать ссылки в новой вкладке

            titleDiv.appendChild(repoLink);

            // Описание репозитория
            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'context_description';
            descriptionDiv.innerHTML = repo.description 
                ? repo.description.replace(/\n/g, '<br>') // Заменяем переносы строк на <br>
                : 'No description provided.';

            // Добавляем название и описание в context_text
            contextTextDiv.appendChild(titleDiv);
            contextTextDiv.appendChild(descriptionDiv);

            // Создаём контейнер для изображения
            const contextMediaDiv = document.createElement('div');
            contextMediaDiv.className = 'context_media';

            contextDiv.appendChild(contextTextDiv);
            contextDiv.appendChild(contextMediaDiv);

            repoList.appendChild(contextDiv);
        });
    } catch (error) {
        console.error('Failed to load repositories:', error);
        document.getElementById('repo-list').textContent = 'Не удалось загрузить список репозиториев.';
    }
}

// Замените 'myusername' на имя пользователя GitHub
const username = 'ynhl42';
loadRepos(username);
