# Cron Job for Expired Subscriptions

Цей cron job автоматично перевіряє закінчені підписки щодня о 09:00 та оновлює їх статус на "inactive".

## Файли

1. **`src/scripts/checkExpiredSubscriptions.ts`** - Основний скрипт для перевірки закінчених підписок
2. **`scripts/check-expired-subscriptions.sh`** - Bash скрипт для запуску через cron
3. **`crontab.example`** - Приклад конфігурації cron

## Встановлення

### 1. Налаштування Cron Job

Додайте наступний рядок до crontab:

```bash
crontab -e
```

І додайте:
```bash
0 9 * * * /home/vika/Desktop/olimpX/backend/scripts/check-expired-subscriptions.sh >> /var/log/olimpx-subscription-cron.log 2>&1
```

### 2. Альтернативний спосіб (системний cron)

Скопіюйте файл `crontab.example` в `/etc/cron.d/olimpx-subscriptions`:

```bash
sudo cp crontab.example /etc/cron.d/olimpx-subscriptions
```

### 3. Перевірка прав доступу

Переконайтеся, що скрипт має права на виконання:

```bash
chmod +x scripts/check-expired-subscriptions.sh
```

## Ручний запуск

Для тестування можна запустити скрипт вручну:

```bash
# Через npm script
npm run cron:check-expired

# Або напряму
./scripts/check-expired-subscriptions.sh
```

## Логування

- Логи пишуться в `/var/log/olimpx-subscription-cron.log`
- Для створення файлу логу:
```bash
sudo touch /var/log/olimpx-subscription-cron.log
sudo chmod 666 /var/log/olimpx-subscription-cron.log
```

## Як це працює

1. Скрипт перевіряє всі профілі зі статусом підписки "active"
2. Знаходить ті, у яких `subscription_expires_at` менший за поточний час
3. Оновлює їх статус на "inactive"
4. Логує всі дії для аудиту

## Тестування

Для тестування можна змінити cron на частіший запуск:

```bash
# Кожні 6 годин для тестування
*/6 * * * * /home/vika/Desktop/olimpX/backend/scripts/check-expired-subscriptions.sh >> /var/log/olimpx-subscription-cron.log 2>&1
```

## Вимоги

- Node.js та tsx повинні бути встановлені
- Змінні середовища Supabase повинні бути налаштовані в `.env` файлі
- Права доступу до бази даних для оновлення профілів користувачів
