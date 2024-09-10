// Подключение к Telegram Web Apps API
Telegram.WebApp.ready();

// Расширение приложения до максимальной высоты
Telegram.WebApp.expand();

// Функция для форматирования чисел с разделителями тысяч
function formatNumberWithSpaces(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Обработчик ввода для поля суммы
document.getElementById('amount').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s+/g, '');
    if (!isNaN(value) && value.length > 0) {
        e.target.value = formatNumberWithSpaces(value);
    }
});

// Инициализация частиц
particlesJS('particles-js', {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "#ffffff"
        },
        shape: {
            type: "circle",
            stroke: {
                width: 0,
                color: "#000000"
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.5,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: false
        },
        move: {
            enable: true,
            speed: 2,
            direction: "top",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: false
            },
            onclick: {
                enable: false
            },
            resize: true
        }
    },
    retina_detect: true
});

const tabs = document.querySelectorAll('.tab');
const tabSlider = document.querySelector('.tab-slider');
const paymentMethodText = document.getElementById('paymentMethodText');

function updateTabSlider(activeTab) {
    const tabWidth = activeTab.offsetWidth;
    const tabLeft = activeTab.offsetLeft;
    tabSlider.style.width = `${tabWidth}px`;
    
    if (activeTab.dataset.tab === 'transfer') {
        tabSlider.style.transform = `translateX(${tabLeft - 2}px)`;
        paymentMethodText.textContent = 'Я сделаю перевод на карту';
    } else {
        tabSlider.style.transform = `translateX(${tabLeft - 3}px)`;
        paymentMethodText.textContent = 'Я передам деньги наличными';
    }
}

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Content').classList.add('active');
        updateTabSlider(tab);
    });

    if (tab.classList.contains('active')) {
        updateTabSlider(tab);
    }
});

let cachedRates = {};

async function fetchRates() {
    try {
        const response = await fetch('http://localhost:5000/get_rates');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        cachedRates = await response.json();
        console.log('Fetched rates:', cachedRates);
    } catch (error) {
        console.error('Error fetching rates:', error);
    }
}

async function calculateExchange() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const paymentMethod = document.querySelector('.tab.active').dataset.tab;
    const amount = parseFloat(document.getElementById('amount').value.replace(/\s+/g, ''));

    if (fromCurrency === toCurrency) {
        alert('Пожалуйста, выберите разные валюты для обмена.');
        return;
    }

    if (!cachedRates.usdt_rate || !cachedRates.bybit_rate_thb) {
        await fetchRates();
    }

    let rubAmount = amount;
    let thbAmount = 0;

    if (fromCurrency === 'RUB' && toCurrency === 'THB') {
        const usdtRate = parseFloat(cachedRates.usdt_rate);
        const bybitRateThb = parseFloat(cachedRates.bybit_rate_thb);
        thbAmount = (rubAmount / usdtRate) * bybitRateThb;
    }

    let fee = 0.007;  // 0.7% базовая комиссия
    if (rubAmount >= 1000000) fee = 0.005;
    else if (rubAmount >= 300000) fee = 0.006;

    if (paymentMethod === 'cash') fee += 0.001;  // Дополнительные 0.1% для наличных

    thbAmount *= (1 - fee);

    const currentDate = new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });

    const resultElement = document.getElementById('result');
    const exchangeRate = (rubAmount / thbAmount).toFixed(3);
    resultElement.innerHTML = `
        Дата и время: ${currentDate}<br>
        Отдаем: ${fromCurrency} ${formatNumberWithSpaces(rubAmount.toFixed(0))}<br>
        Получаем: ${toCurrency} ${formatNumberWithSpaces(thbAmount.toFixed(0))}<br>
        Способ оплаты: ${paymentMethod === 'transfer' ? 'Перевод ' + fromCurrency + ' на карту' : 'Передам ' + fromCurrency + ' наличными'}<br>
        Курс: 1 ${toCurrency} = ${exchangeRate} ${fromCurrency}<br>
    `;
    // Комиссия: ${(fee * 100).toFixed(2)}%
    resultElement.classList.remove('show');
    void resultElement.offsetWidth; // Trigger reflow to restart animation
    resultElement.classList.add('show');
}

fetchRates();

const logoCube = document.getElementById('logoCube');
let clickCount = 0;

logoCube.addEventListener('click', () => {
    clickCount++;
    logoCube.style.transform = 'scale(1.1)';
    setTimeout(() => {
        logoCube.style.transform = 'scale(1)';
    }, 200);

    const currencySymbols = ['$', '€', '¥', '£', '₽'];
    const symbol = currencySymbols[Math.floor(Math.random() * currencySymbols.length)];
    const symbolElement = document.createElement('div');
    symbolElement.classList.add('currency-symbol');
    symbolElement.textContent = symbol;
    document.body.appendChild(symbolElement);

    const rect = logoCube.getBoundingClientRect();
    const randomOffset = Math.random() * 100 - 50; // Настройка границы появления символов
    symbolElement.style.left = `${rect.left + rect.width / 2 + randomOffset}px`;
    symbolElement.style.top = `${rect.top}px`;

    setTimeout(() => {
        symbolElement.remove();
    }, 1000);

    if (clickCount >= 10) {
        logoCube.style.animation = 'shake 0.5s';
        setTimeout(() => {
            logoCube.style.animation = '';
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const symbol = currencySymbols[Math.floor(Math.random() * currencySymbols.length)];
                    const symbolElement = document.createElement('div');
                    symbolElement.classList.add('currency-symbol');
                    symbolElement.textContent = symbol;
                    document.body.appendChild(symbolElement);

                    const randomOffset = Math.random() * 100 - 50; // Настройка границы появления символов
                    symbolElement.style.left = `${rect.left + rect.width / 2 + randomOffset}px`;
                    symbolElement.style.top = `${rect.top}px`;

                    setTimeout(() => {
                        symbolElement.remove();
                    }, 1000);
                }, i * 50); // Добавлена задержка для каждого символа
            }
            clickCount = 0;
        }, 500);
    }
});

// Обновление placeholder и значения поля ввода суммы при изменении валюты
const fromCurrencySelect = document.getElementById('fromCurrency');
const amountInput = document.getElementById('amount');

fromCurrencySelect.addEventListener('change', () => {
    const selectedCurrency = fromCurrencySelect.value;
    amountInput.placeholder = `Введите сумму (${selectedCurrency})`;
});

// Инициализация placeholder и значения поля ввода суммы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const selectedCurrency = fromCurrencySelect.value;
    amountInput.placeholder = `Введите сумму (${selectedCurrency})`;
});

// Обработчик ввода для поля суммы с обновлением валюты
amountInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s+/g, ''); // Удаление всех символов, кроме цифр
    if (!isNaN(value) && value.length > 0) {
        e.target.value = formatNumberWithSpaces(value);
    }
});