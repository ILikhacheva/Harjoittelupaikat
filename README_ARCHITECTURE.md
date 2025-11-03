# АРХИТЕКТУРА СИСТЕМЫ УПРАВЛЕНИЯ МЕСТАМИ ПРАКТИКИ
# HARJOITTELUPAIKKOJEN HALLINTAJÄRJESTELMÄN ARKKITEHTUURI

## ОБЗОР СИСТЕМЫ / JÄRJESTELMÄN YLEISKATSAUS

Система управления местами практики - это веб-приложение для управления студентами, компаниями и назначением мест практики.

Harjoittelupaikkojen hallintajärjestelmä on web-sovellus opiskelijoiden, yritysten ja harjoittelupaikkojen hallinnan hallintaan.

## СТРУКТУРА ФАЙЛОВ / TIEDOSTORAKENNE

### Клиентская часть / Asiakaspuoli

1. **index.html** - Главная страница / Pääsivu
   - Содержит все модальные окна и формы
   - Sisältää kaikki modal-ikkunat ja lomakkeet
   - Структурированная разметка с комментариями
   - Rakenteellinen merkintä kommenttien kanssa

2. **app.css** - Стили интерфейса / Käyttöliittymän tyylit
   - Адаптивный дизайн / Responsiivinen suunnittelu
   - Стили модальных окон / Modal-ikkunoiden tyylit
   - Тематическое оформление / Teeman muotoilu

3. **app.js** - Клиентская логика / Asiakaspuolen logiikka
   - Управление модальными окнами / Modal-ikkunoiden hallinta
   - AJAX запросы к API / AJAX API-pyyntöjä
   - Встроенное редактирование таблиц / Sisäänrakennettu taulukon muokkaus
   - Управление ролями пользователей / Käyttäjäroolien hallinta

### Серверная часть / Palvelinpuoli

4. **server.js** - Express.js сервер / Express.js palvelin
   - REST API endpoints / REST API-päätepisteet
   - Аутентификация и авторизация / Autentikointi ja valtuutus
   - Подключение к PostgreSQL / PostgreSQL yhteys
   - Безопасность и валидация / Turvallisuus ja validointi

5. **package.json** - Зависимости проекта / Projektin riippuvuudet
   - Express, bcrypt, cors, pg
   - Скрипты запуска / Käynnistyskomentosarjat

## РОЛИ ПОЛЬЗОВАТЕЛЕЙ / KÄYTTÄJÄROOLIT

### Студент (userRole = "3") / Opiskelija
- Может видеть только свои места практики
- Voi nähdä vain omat harjoittelupaikkansa
- Не может редактировать данные других
- Ei voi muokata muiden tietoja
- Ограниченный доступ к функциям
- Rajoitettu pääsy toimintoihin

### Учитель (userRole = "2") / Opettaja  
- Полный доступ ко всем данным
- Täysi pääsy kaikkiin tietoihin
- Может редактировать студентов и компании
- Voi muokata opiskelijoita ja yrityksiä
- Управление местами практики
- Harjoittelupaikkojen hallinta

## ОСНОВНЫЕ ФУНКЦИИ / PÄÄTOIMINNOT

### 1. Аутентификация / Autentikointi
- Вход и регистрация пользователей
- Käyttäjien kirjautuminen ja rekisteröinti
- Хеширование паролей с bcrypt
- Salasanojen tiivistys bcryptillä
- Сохранение сессий в localStorage
- Istuntojen tallennus localStorageen

### 2. Управление студентами / Opiskelijoiden hallinta
- Добавление новых студентов (учителя)
- Uusien opiskelijoiden lisääminen (opettajat)
- Просмотр списков студентов
- Opiskelijaluettelojen katselu
- Встроенное редактирование в таблице
- Sisäänrakennettu taulukon muokkaus

### 3. Управление компаниями / Yritysten hallinta
- Регистрация компаний и мест практики
- Yritysten ja harjoittelupaikkojen rekisteröinti
- Редактирование информации о компаниях
- Yritystietojen muokkaus
- Управление количеством мест
- Paikkojen määrän hallinta

### 4. Управление местами практики / Harjoittelupaikkojen hallinta
- Назначение студентов на места практики
- Opiskelijoiden osoittaminen harjoittelupaikkoihin
- Отслеживание статуса практики
- Harjoittelun tilan seuranta
- Управление датами начала и окончания
- Aloitus- ja päättymispäivien hallinta
- **Ограничения дат**: Только будущие даты
- **Päivämäärärajoitukset**: Vain tulevat päivämäärät

## БЕЗОПАСНОСТЬ / TURVALLISUUS

### Клиентская сторона / Asiakaspuoli
- Проверка ролей перед показом элементов UI
- Roolien tarkistus ennen UI-elementtien näyttämistä
- Валидация форм перед отправкой
- Lomakkeiden validointi ennen lähettämistä
- Ограничения дат в календаре
- Päivämäärärajoitukset kalenterissa

### Серверная сторона / Palvelinpuoli
- Проверка ролей в каждом API endpoint
- Roolien tarkistus jokaisessa API-päätepisteessä
- Хеширование паролей с bcrypt
- Salasanojen tiivistys bcryptillä
- SQL инъекции защита через параметризованные запросы
- SQL-injektiosuoja parametrisoitujen kyselyjen kautta
- Валидация входных данных
- Syöttötietojen validointi

## БАЗА ДАННЫХ / TIETOKANTA

PostgreSQL таблицы / PostgreSQL taulut:

1. **students** - Студенты / Opiskelijat
   - student_id, st_name, st_group

2. **companies** - Компании / Yritykset  
   - company_id, company_name, count_place, tunnus, address

3. **workplace** - Места практики / Harjoittelupaikat
   - row_id, student_id, company_id, boss_name, boss_phone, boss_email
   - begin_date, end_date, lunch_money, city, status

4. **users** - Пользователи / Käyttäjät
   - user_id, user_email, user_password, user_name, user_role, student_id

## ТЕХНОЛОГИИ / TEKNOLOGIAT

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Адаптивный дизайн / Responsiivinen suunnittelu
- Модальные окна / Modal-ikkunat
- Fetch API для AJAX запросов / Fetch API AJAX-pyynnöille

### Backend  
- Node.js + Express.js
- PostgreSQL база данных / PostgreSQL tietokanta
- bcrypt для хеширования / bcrypt tiivistykseen
- CORS для кросс-доменных запросов / CORS cross-origin pyynnöille

## ОСОБЕННОСТИ РЕАЛИЗАЦИИ / TOTEUTUKSEN OMINAISUUDET

### 1. Встроенное редактирование / Sisäänrakennettu muokkaus
Редактирование происходит прямо в таблице без отдельных форм:
Muokkaus tapahtuu suoraan taulukossa ilman erillisiä lomakkeita:
- Клик на иконку карандаша ✏️
- Hiiren napsautus lyijykynäkuvakkeelle ✏️
- Поля превращаются в input элементы
- Kentät muuttuvat syöttöelementeiksi
- Кнопки сохранить 💾 и отменить ✖️
- Tallenna 💾 ja peruuta ✖️ painikkeet

### 2. Ограничения дат / Päivämäärärajoitukset
- Нельзя выбрать прошедшие даты
- Menneistä päivämääristä ei voi valita
- Дата окончания не может быть раньше начала
- Loppupäivä ei voi olla ennen alkupäivää
- Автоматическое обновление минимальных дат
- Automaattinen vähimmäispäivien päivitys

### 3. Ролевая система / Roolijärjestelmä
- Динамическое скрытие/показ элементов
- Dynaaminen elementtien piilotus/näyttäminen
- Серверная валидация прав доступа
- Palvelinpuolen käyttöoikeuksien validointi
- localStorage для сохранения состояния
- localStorage tilan tallentamiseen

## ЗАПУСК ПРОЕКТА / PROJEKTIN KÄYNNISTYS

1. Установка зависимостей / Riippuvuuksien asennus:
   ```bash
   npm install
   ```

2. Настройка базы данных PostgreSQL / PostgreSQL tietokannan konfigurointi
   
3. Создание .env файла с настройками БД / .env tiedoston luominen DB asetuksilla

4. Запуск сервера / Palvelimen käynnistys:
   ```bash
   npm start
   ```

5. Открыть в браузере / Avaa selaimessa: http://localhost:3000

## БУДУЩИЕ УЛУЧШЕНИЯ / TULEVAT PARANNUKSET

- Добавление системы уведомлений / Ilmoitusjärjestelmän lisääminen
- Экспорт данных в Excel/PDF / Tietojen vienti Excel/PDF-muotoon  
- Календарный вид мест практики / Harjoittelupaikkojen kalenterinäkymä
- Система комментариев и отзывов / Kommentti- ja palautejärjestelmä
- Мобильное приложение / Mobiilisovellus