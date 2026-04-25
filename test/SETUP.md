# Настройка тестов Hardhat

## Решение проблемы ESM

Hardhat 3.x требует ESM формат. В `package.json` добавлено `"type": "module"`.

Если у вас возникли проблемы с React Scripts после этого изменения:

1. **Проверьте импорты в React коде** - они должны использовать `import`, а не `require`
2. **Если есть проблемы**, можно создать отдельную папку для Hardhat тестов:

```bash
mkdir hardhat-tests
cd hardhat-tests
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
# Скопируйте hardhat.config.js и тесты туда
```

## Альтернативное решение

Если не хотите добавлять `"type": "module"` в основной package.json:

1. Удалите `"type": "module"` из package.json
2. Используйте Hardhat 2.x (который поддерживает CommonJS):
   ```bash
   npm install --save-dev hardhat@^2.22.0
   ```
3. Перепишите конфиг и тесты в CommonJS формат (require/module.exports)

## Текущая конфигурация

- ✅ `"type": "module"` в package.json
- ✅ ESM формат в hardhat.config.js
- ✅ ESM формат в тестах
- ✅ Используется ethers v6 API (parseEther вместо utils.parseEther)

## Запуск тестов

```bash
npx hardhat test test/MicroTender.test.js
```
