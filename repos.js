async function loadRepositories(username) {
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
            // Создаём элемент для каждого репозитория
            const listItem = document.createElement('li');

            // Ссылка на репозиторий
            const repoLink = document.createElement('a');
            repoLink.href = repo.html_url;
            repoLink.textContent = repo.name;
            repoLink.target = '_blank'; // Открывать ссылки в новой вкладке

            // Описание репозитория
            const repoDescription = document.createElement('p');
            repoDescription.textContent = repo.description || 'No description provided.';

            // Добавляем элементы в список
            listItem.appendChild(repoLink);
            listItem.appendChild(repoDescription);
            repoList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Failed to load repositories:', error);
        document.getElementById('repo-list').textContent = 'Не удалось загрузить список репозиториев.';
    }
}

// Замените 'myusername' на имя пользователя GitHub
const username = 'ynhl42';
document.getElementById('username').textContent = username;
loadRepositories(username);
