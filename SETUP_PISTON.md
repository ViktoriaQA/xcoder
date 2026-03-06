# Налаштування Piston API для виконання коду

## Проблема
Публічний Piston API (https://emkc.org/api/v2/piston) став whitelist-only з 15 лютого 2026 року.

## Рішення: Розгортання власного Piston інстансу

### Крок 1: Запустіть Piston API

#### Для локальної розробки:
```bash
# Варіант A: Використовуючи окремий Docker Compose файл
docker-compose -f docker-compose.piston.yml up -d

# Варіант B: Використовуючи основний Docker Compose
docker-compose up -d piston

# Варіант C: Вручну через Docker
docker run -d \
  --name piston-api \
  -p 2000:2000 \
  ghcr.io/engineer-man/piston:latest
```

#### Для продакшену:
```bash
# Запуск всіх сервісів включно з Piston
docker-compose up -d

# Перевірка статусу
docker-compose ps
```

### Крок 2: Налаштуйте змінні середовища

#### Локальна розробка (.env файл):
```
PISTON_API_URL=http://localhost:2000
```

#### Продакшен (змінні середовища):
```bash
export PISTON_API_URL=http://piston:2000
```

### Крок 3: Перезапустіть бекенд
```bash
cd backend
npm run dev
```

### Крок 4: Перевірка роботи

#### Локальна перевірка:
```bash
curl http://localhost:2000/runtimes
```

#### Продакшен перевірка:
```bash
docker-compose exec app curl http://piston:2000/runtimes
```

## Архітектура продакшену

### Docker мережа
- **app**: основний додаток (порт 8080)
- **piston**: сервіс виконання коду (внутрішній порт 2000)
- **app-network**: ізольована мережа для комунікації

### Комунікація сервісів
```
Клієнт → App (8080) → Piston (2000) [внутрішньо]
```

### Безпека
- Piston API доступний тільки зсередини Docker мережі
- Зовнішній доступ до порту 2000 можна обмежити
- Автоматичне перезавантаження при збоях

## Альтернативні варіанти

### Варіант 2: Отримати доступ до публічного API
1. Зв'яжіться з EngineerMan в Discord
2. Надайте обґрунтування використання API
3. Отримайте whitelist доступ

### Варіант 3: Використати інші сервіси
- **Judge0 API**: більш потужний, але платний
- **OnlineGDB API**: обмежена безкоштовна версія
- **Власна реалізація**: повний контроль, але складно

## Переваги власного інстансу
- ✅ Повний контроль над середовищем
- ✅ Немає обмежень по запитах
- ✅ Підтримка кастомних мов
- ✅ Офлайн робота
- ✅ Безпека даних
- ✅ Незалежність від зовнішніх сервісів

## Моніторинг та логування

### Перевірка здоров'я сервісу:
```bash
# Статус контейнерів
docker-compose ps

# Логи Piston
docker-compose logs piston

# Логи додатку
docker-compose logs app
```

### Моніторинг ресурсів:
```bash
# Використання пам'яті та CPU
docker stats

# Інформація про контейнер
docker inspect piston-api
```

## Налаштування та оптимізація

### Обмеження ресурсів (docker-compose.yml):
```yaml
piston:
  image: ghcr.io/engineer-man/piston:latest
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
      reservations:
        cpus: '1.0'
        memory: 1G
```

### Налаштування таймаутів:
```yaml
environment:
  - PISTON_LOG_LEVEL=info
  - PISTON_TIMEOUT=30
```

## Тестування

### Unit тести для сервісу:
```bash
cd backend
npm test -- --testPathPattern=piston
```

### Інтеграційні тести:
```bash
# Тест виконання коду
curl -X POST http://localhost:8080/api/code-execution/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "version": "18.15.0",
    "code": "console.log(\"Hello World\");"
  }'
```

## Вирішення проблем

### Часті помилки:
1. **Connection refused**: Piston не запущений
2. **Timeout**: Перевірте мережу та ресурси
3. **Memory limit**: Збільште ліміти пам'яті

### Діагностика:
```bash
# Перевірка мережі
docker network ls
docker network inspect olimpx_app-network

# Тест з'єднання
docker-compose exec app ping piston
```

## Розгортання на хмарних платформах

### Railway:
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "docker-compose up -d"
  }
}
```

### Render:
- Створити два сервіси: web service (app) + private service (piston)
- Налаштувати змінні середовища

### AWS ECS:
- Використовувати Fargate для обох сервісів
- Налаштувати Application Load Balancer

## Оновлення та обслуговування

### Оновлення Piston:
```bash
docker-compose pull piston
docker-compose up -d piston
```

### Резервне копіювання:
```bash
# Збереження даних Piston
docker run --rm -v olimpx_piston_data:/data -v $(pwd):/backup alpine tar czf /backup/piston-backup.tar.gz -C /data .
```

## Висновок
Власний Piston інстанс забезпечує надійність, безпеку та незалежність для функціональності виконання коду у вашому додатку.
