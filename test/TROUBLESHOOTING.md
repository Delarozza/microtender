# Решение проблемы с Hardhat тестами

## Проблема

При запуске `npx hardhat test` возникает ошибка:
```
TypeError: Class extends value undefined is not a constructor or null
```

Это известная проблема совместимости @nomicfoundation/hardhat-ethers с ESM.

## Решение 1: Переустановка зависимостей

```bash
# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановите зависимости
npm install

# Попробуйте запустить тесты снова
npx hardhat test test/MicroTender.test.js
```

## Решение 2: Использование Hardhat 2.x (CommonJS)

Если решение 1 не помогло, можно использовать Hardhat 2.x:

```bash
# Удалите текущие версии
npm uninstall hardhat @nomicfoundation/hardhat-toolbox

# Установите Hardhat 2.x
npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0

# Удалите "type": "module" из package.json
# Перепишите hardhat.config.js в CommonJS:
# require("@nomicfoundation/hardhat-toolbox");
# module.exports = { ... }

# Перепишите тесты в CommonJS:
# const { expect } = require("chai");
# const { ethers } = require("hardhat");
```

## Решение 3: Отдельная папка для Hardhat

Создайте отдельную папку для Hardhat тестов:

```bash
mkdir hardhat-project
cd hardhat-project
npm init -y
npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0
# Скопируйте туда hardhat.config.js и тесты
# Используйте CommonJS формат
```

## Решение 4: Обновление Node.js

Убедитесь, что используете Node.js версии 18 или выше:

```bash
node --version  # Должно быть v18+
```

## Временное решение

Если ничего не помогает, можно запускать тесты через Remix IDE или использовать ручной чеклист из `manual-test-checklist.md`.

## Статус проблемы

Это известная проблема в экосистеме Hardhat. Следите за обновлениями:
- https://github.com/NomicFoundation/hardhat/issues
- https://github.com/NomicFoundation/hardhat-ethers/issues
