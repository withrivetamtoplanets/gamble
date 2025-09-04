document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const submitLogin = document.getElementById('submit-login');
    const submitRegister = document.getElementById('submit-register');
    const logoutBtn = document.getElementById('logout-btn');
    const userContent = document.getElementById('user-content');
    const guestContent = document.getElementById('guest-content');
    const userNameSpan = document.getElementById('user-name');
    const userIdSpan = document.getElementById('user-id');
    const closeButtons = document.querySelectorAll('.close');
    
    // Игровые элементы
    let balance = 0;
    const balanceElement = document.querySelector('.balance');
    const clickerBtn = document.getElementById('clicker-btn');
    const tasksBtn = document.getElementById('tasks-btn');
    const tasksContainer = document.getElementById('tasks-container');
    const gameBtn = document.getElementById('game-btn');
    const gameContainer = document.getElementById('game-container');
    const closeGameBtn = document.getElementById('close-game');
    const completeTaskButtons = document.querySelectorAll('.complete-task');
    const notification = document.getElementById('notification');
    const requestWithdrawBtn = document.getElementById('request-withdraw');
    const withdrawAmount = document.getElementById('withdraw-amount');
    const paymentDetails = document.getElementById('payment-details');
    
    // Инициализация игры
    const gameCards = document.querySelectorAll('.game-card');
    const attemptsElement = document.getElementById('attempts-left');
    let attempts = 3;
    let treasureIndex = Math.floor(Math.random() * 9);
    let gameActive = false;
    
    // Текущий пользователь
    let currentUser = null;
    
    // Проверка авторизации при загрузке
    checkAuth();
    
    // Функция проверки авторизации
    function checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showUserContent();
            loadUserData();
        } else {
            showGuestContent();
        }
    }
    
    // Показать контент для авторизованного пользователя
    function showUserContent() {
        userContent.style.display = 'block';
        guestContent.style.display = 'none';
        userNameSpan.textContent = currentUser.username;
        userIdSpan.textContent = currentUser.id;
    }
    
    // Показать контент для гостя
    function showGuestContent() {
        userContent.style.display = 'none';
        guestContent.style.display = 'block';
    }
    
    // Загрузка данных пользователя
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser.id}`) || '{}');
        balance = userData.balance || 0;
        updateBalance(0);
        
        // Обновляем статус выполненных заданий
        if (userData.completedTasks) {
            completeTaskButtons.forEach((button, index) => {
                if (userData.completedTasks[index]) {
                    button.textContent = 'Выполнено!';
                    button.disabled = true;
                    button.style.backgroundColor = '#95a5a6';
                }
            });
        }
    }
    
    // Сохранение данных пользователя
    function saveUserData() {
        const completedTasks = Array.from(completeTaskButtons).map(btn => btn.disabled);
        const userData = {
            balance: balance,
            completedTasks: completedTasks,
            username: currentUser.username,
            email: currentUser.email
        };
        localStorage.setItem(`user_${currentUser.id}`, JSON.stringify(userData));
    }
    
    // Генерация уникального ID пользователя
    function generateUserId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Обновление баланса
    function updateBalance(amount) {
        balance += amount;
        balance = Math.round(balance * 100) / 100;
        balanceElement.textContent = `${balance.toFixed(2)} ₽`;
        
        if (currentUser) {
            saveUserData();
        }
        
        if (amount > 0) {
            notification.textContent = `+${amount.toFixed(2)} ₽`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }
    }
    
    // Открытие модальных окон
    loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
    registerBtn.addEventListener('click', () => registerModal.style.display = 'block');
    
    // Закрытие модальных окон
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });
    
    // Обработка регистрации
    submitRegister.addEventListener('click', function() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const messageDiv = document.getElementById('register-message');
        
        if (!username || !email || !password) {
            messageDiv.textContent = 'Все поля обязательны для заполнения';
            messageDiv.style.color = 'red';
            return;
        }
        
        // Проверяем, нет ли уже пользователя с таким email
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(user => user.email === email)) {
            messageDiv.textContent = 'Пользователь с таким email уже существует';
            messageDiv.style.color = 'red';
            return;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: generateUserId(),
            username: username,
            email: email,
            password: password, // В реальном приложении пароль нужно хэшировать!
            registrationDate: new Date().toISOString()
        };
        
        // Сохраняем пользователя
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Авторизуем пользователя
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Создаем запись для данных пользователя
        const userData = {
            balance: 0,
            completedTasks: [false, false, false],
            username: username,
            email: email
        };
        localStorage.setItem(`user_${newUser.id}`, JSON.stringify(userData));
        
        // Показываем контент пользователя
        showUserContent();
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        
        // Очищаем форму
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
    });
    
    // Обработка входа
    submitLogin.addEventListener('click', function() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const messageDiv = document.getElementById('login-message');
        
        if (!email || !password) {
            messageDiv.textContent = 'Введите email и пароль';
            messageDiv.style.color = 'red';
            return;
        }
        
        // Ищем пользователя
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Авторизуем пользователя
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Показываем контент пользователя
            showUserContent();
            loadUserData();
            loginModal.style.display = 'none';
            
            // Очищаем форму
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
        } else {
            messageDiv.textContent = 'Неверный email или пароль';
            messageDiv.style.color = 'red';
        }
    });
    
    // Выход из аккаунта
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showGuestContent();
    });
    
    // Игровая логика (только для авторизованных пользователей)
    clickerBtn.addEventListener('click', function() {
        if (!currentUser) return;
        updateBalance(0.01);
    });
    
    tasksBtn.addEventListener('click', function() {
        if (tasksContainer.style.display === 'none') {
            tasksContainer.style.display = 'block';
            tasksBtn.textContent = 'Скрыть задания';
        } else {
            tasksContainer.style.display = 'none';
            tasksBtn.textContent = 'Показать задания';
        }
    });
    
    completeTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!currentUser) return;
            const reward = parseInt(this.getAttribute('data-reward'));
            updateBalance(reward);
            this.textContent = 'Выполнено!';
            this.disabled = true;
            this.style.backgroundColor = '#95a5a6';
            saveUserData();
        });
    });
    
    gameBtn.addEventListener('click', function() {
        if (!currentUser) return;
        gameContainer.style.display = 'block';
        resetGame();
        gameActive = true;
    });
    
    closeGameBtn.addEventListener('click', function() {
        gameContainer.style.display = 'none';
        gameActive = false;
    });
    
    function resetGame() {
        attempts = 3;
        attemptsElement.textContent = attempts;
        treasureIndex = Math.floor(Math.random() * 9);
        
        gameCards.forEach(card => {
            card.textContent = '?';
            card.style.backgroundColor = '#3498db';
            card.style.cursor = 'pointer';
        });
    }
    
    gameCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            if (!currentUser || !gameActive || attempts <= 0 || this.textContent !== '?') return;
            
            if (index === treasureIndex) {
                this.textContent = '💰';
                this.style.backgroundColor = '#f1c40f';
                const reward = attempts * 3.33;
                updateBalance(reward);
                gameActive = false;
                
                setTimeout(() => {
                    alert(`Поздравляем! Вы нашли сокровище и заработали ${reward.toFixed(2)} рублей!`);
                }, 500);
            } else {
                this.textContent = '❌';
                this.style.backgroundColor = '#e74c3c';
                attempts--;
                attemptsElement.textContent = attempts;
                
                if (attempts <= 0) {
                    gameActive = false;
                    setTimeout(() => {
                        alert('Игра окончена. Попробуйте еще раз!');
                    }, 500);
                }
            }
        });
    });
    
    // Запрос на вывод средств
    requestWithdrawBtn.addEventListener('click', function() {
        if (!currentUser) return;
        
        const amount = parseFloat(withdrawAmount.value);
        const details = paymentDetails.value.trim();
        
        if (amount < 50) {
            alert('Минимальная сумма вывода - 50 рублей');
            return;
        }
        
        if (amount > balance) {
            alert('Недостаточно средств на балансе');
            return;
        }
        
        if (!details) {
            alert('Введите реквизиты для получения средств');
            return;
        }
        
        // Сохраняем запрос на вывод
        const withdrawRequests = JSON.parse(localStorage.getItem('withdrawRequests') || '[]');
        withdrawRequests.push({
            userId: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            amount: amount,
            details: details,
            date: new Date().toISOString(),
            status: 'pending'
        });
        
        localStorage.setItem('withdrawRequests', JSON.stringify(withdrawRequests));
        
        alert('Запрос на вывод отправлен администратору! Ожидайте перевода в течение 24 часов.');
        
        // Очищаем поля
        withdrawAmount.value = '';
        paymentDetails.value = '';
    });
});