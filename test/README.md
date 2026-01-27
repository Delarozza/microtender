# Тесты для MicroTender

Этот каталог содержит тесты для проверки функциональности MicroTender системы.

## Структура тестов

- `MicroTender.test.js` - Hardhat тесты для smart contract
- `manual-test-checklist.md` - Ручной чеклист для тестирования UI
- `../src/App.test.js` - React тесты для frontend компонентов

## Установка зависимостей для Hardhat тестов

Зависимости уже установлены в проекте:
- `hardhat@^2.22.0` - Hardhat 2.x (совместим с CommonJS)
- `@nomicfoundation/hardhat-toolbox@^5.0.0` - Набор инструментов для тестирования

Если нужно переустановить:
```bash
npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0
```

## Запуск тестов

### Smart Contract тесты (Hardhat)

```bash
# Установите Hardhat (если еще не установлен)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Создайте hardhat.config.js (см. пример ниже)

# Запустите тесты
npx hardhat test test/MicroTender.test.js
```

### Frontend тесты (Jest)

```bash
npm test
```

### Ручное тестирование

Следуйте инструкциям в `manual-test-checklist.md`

## Конфигурация

Конфигурация Hardhat находится в `hardhat.config.js` в корне проекта.

**Важно:** Проект использует CommonJS формат (не ESM), поэтому:
- `package.json` НЕ содержит `"type": "module"`
- Используется `require()` и `module.exports`
- Hardhat версии 2.x (совместим с CommonJS)

## Что тестируется

### Smart Contract тесты

1. **Deployment** - развертывание контракта
2. **Role Management** - управление ролями
3. **Tender Creation** - создание тендеров
4. **Tender Publishing** - публикация тендеров
5. **Vendor Registration** - регистрация поставщиков
6. **Bid Submission** - подача предложений
7. **Voting** - голосование
8. **Tender Finalization** - финализация тендеров
9. **Helper Functions** - вспомогательные функции

### Frontend тесты

1. **Rendering** - отображение компонентов
2. **User Interaction** - взаимодействие пользователя
3. **Form Validation** - валидация форм
4. **Currency Conversion** - конвертация валют
5. **Error Handling** - обработка ошибок

### Ручное тестирование

1. **End-to-End Workflow** - полный цикл работы системы
2. **UI/UX** - пользовательский интерфейс
3. **Edge Cases** - граничные случаи
4. **Security** - проверка безопасности

## Покрытие тестами

Текущее покрытие:
- Smart Contract: ~90% основных функций
- Frontend: базовая проверка компонентов
- Интеграционные: через ручное тестирование

## Добавление новых тестов

При добавлении новых функций:

1. Добавьте unit тесты в `MicroTender.test.js`
2. Обновите ручной чеклист в `manual-test-checklist.md`
3. Добавьте frontend тесты в `src/App.test.js` если нужно

## Известные ограничения

- Frontend тесты требуют мокирования ethers.js и window.ethereum
- Интеграционные тесты лучше выполнять вручную на testnet
- Некоторые edge cases требуют ручной проверки
