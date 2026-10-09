# 🚀 ДЕПЛОЙ ИСПРАВЛЕНИЙ OVERFLOW

## ✅ ЧТО ИСПРАВЛЕНО

### 1. Header.css - КОРНЕВАЯ ПРИЧИНА
**Проблема:** `width: 100%` + `padding: 0 20px` = 360px на экране 320px

**Исправлено:**
- `.header-title`: `padding: 0`, `width: calc(100% - 40px)`
- `.header-subtitle`: `padding: 0`, `width: calc(100% - 40px)`
- `.header-text-overlay`: `width: calc(90% - 20px)` (учет blur)

### 2. ProfilePage.tsx - TypeScript ошибка
**Исправлено:** `user?.role` → `user?.roles?.includes('ADMIN')`

### 3. Deploy скрипт - Docker кэш
**Добавлено:**
- Удаление старого образа frontend
- Пересборка с `--no-cache`
- Полное пересоздание контейнеров

## 🚀 КОМАНДА ДЕПЛОЯ

```bash
cd /Users/ilanevejkin/Desktop/FINDS-BECK
./deploy-remote.sh
```

## 📝 ЧТО ВВОДИТЬ

1. `Continue with deployment? (yes/no):` → **yes**
2. **Пароль SSH** (3-4 раза)
3. `Restart services? (yes/no):` → **yes**

## ⏱️ ВРЕМЯ

- Backup: ~30 сек
- Копирование: ~1 мин
- **Rebuild --no-cache: ~5-7 мин** (дольше из-за --no-cache)
- Запуск: ~30 сек

**Общее: ~7-10 минут**

## ✅ ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### 1. Открыть сайт
```
https://finds-shop.ru
```

### 2. DevTools проверка
- F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Выбрать iPhone SE (320px)
- Проверить главную страницу

### 3. Console проверка
```javascript
// Должно быть true
document.documentElement.scrollWidth === document.documentElement.clientWidth

// Найти overflow элементы (должен быть пустой массив)
const vw = document.documentElement.clientWidth;
[...document.querySelectorAll('*')].filter(el => 
  el.getBoundingClientRect().right > vw
).map(el => el.className)
```

### 4. Проверить страницы
- ✅ Главная (/)
- ✅ Личный кабинет (/profile)
- ✅ Любая страница товара

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

### До:
- ❌ Горизонтальный скролл
- ❌ Тень под subtitle выходит за экран
- ❌ scrollWidth = 360px на viewport 320px

### После:
- ✅ Нет горизонтального скролла
- ✅ Все элементы помещаются
- ✅ scrollWidth = 320px на viewport 320px

## 🔙 ОТКАТ (если нужен)

```bash
ssh root@139.100.205.250
cd /opt/finds-beck
ls -la backups/
cp -r backups/backup_YYYY-MM-DD_HH-MM-SS/* .
docker compose -f docker-compose.prod.yml restart
```

---

**ГОТОВО! Запускай деплой** 🚀
