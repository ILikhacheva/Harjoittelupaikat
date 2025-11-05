# Harjoittelupaikkojen Hallintajärjestelmä

Moderni web-sovellus harjoittelupaikkojen hallintaan oppilaitoksille. Järjestelmä mahdollistaa opiskelijoiden, yritysten ja harjoittelupaikkojen tehokkaan hallinnan.

##  Ominaisuudet

###  Käyttäjähallinta
- **Kolme käyttäjäroolia:**
  - Admin (rooli 1) - täysi järjestelmän hallinta
  - Opettaja (rooli 2) - harjoittelupaikkojen ja opiskelijoiden hallinta
  - Opiskelija (rooli 3) - oman tiedon tarkastelu ja muokkaus
- Turvallinen sisäänkirjautuminen salasanojen salauksella
- Admin-paneeli käyttäjien hallintaan
- Salasanan nollausmahdollisuus ylläpitäjälle

###  Opiskelijahallinta
- Opiskelijoiden lisääminen ja muokkaaminen
- Ryhmittely ryhmien mukaan
- Hakutoiminto nimellä tai ryhmällä
- Lajittelumahdollisuudet

###  Yritystenhallinta
- Yritysten rekisteröinti ja tietojen ylläpito
- Harjoittelupaikkojen määrän seuranta
- Y-tunnuksen ja osoitetietojen hallinta
- Suodatus- ja hakutoiminnot

###  Harjoittelupaikkojen hallinta
- Harjoittelupaikkojen määritys ja hallinta
- Ohjaajan yhteystietojen ylläpito
- Aikataulun seuranta (alku- ja loppupäivämäärät)
- Ruokarahan merkitseminen
- Status-seuranta (On/Odottaa/Ei)

###  Raportointijärjestelmä
- **Opiskelijaraportti:** Yksityiskohtainen listaus kaikista harjoittelupaikoista
- **Yritysraportti:** Tilastollinen yhteenveto yrityksittäin
- PDF-vientitoiminto molemmille raporteille
- Tulostusmahdollisuus

###  Hakutoiminnot
- Reaaliaikainen haku kaikissa taulukoissa
- Suodatusmahdollisuudet roolin, ryhmän ja osoitteen mukaan
- Lajittelutoiminnot palvelinpuolella

##  Tekninen toteutus

### Frontend
- **HTML5** - Semanttinen rakenne
- **CSS3** - Moderni ulkoasu responsiivisella suunnittelulla
- **JavaScript** - Dynaaminen käyttöliittymä
- **Modal-ikkunat** - Käyttäjäystävällinen vuorovaikutus

### Backend
- **Node.js** - Palvelinympäristö
- **Express.js** - Web-sovelluskehys
- **PostgreSQL** - Tietokantajärjestelmä
- **bcrypt** - Salasanojen salaus
- **CORS** - Cross-origin resurssien jakaminen

### Tietoturva
- Salasanojen bcrypt-salaus
- SQL-injection suojaus parametrikyselyillä
- Roolipohjainen käyttöoikeuksien hallinta
- Session-hallinta

##  Projektin rakenne

```
sivu_harjoittelupaikka/
├── index.html          # Pääsivu ja käyttöliittymä
├── app.js             # Client-side JavaScript
├── server.js          # Express.js palvelin
├── app.css            # Tyylitiedosto
├── package.json       # NPM riippuvuudet
└── README.md          # Projektin dokumentaatio
```

##  Asennus ja käyttöönotto

### Edellytykset
- Node.js (versio 14 tai uudempi)
- PostgreSQL tietokanta
- NPM paketinhallinta

### Asentaminen

1. **Kloonaa repositorio:**
   ```bash
   git clone https://github.com/ILikhacheva/Harjoittelupaikat.git
   cd Harjoittelupaikat
   ```

2. **Asenna riippuvuudet:**
   ```bash
   npm install
   ```

3. **Konfiguroi tietokanta:**
   - Luo PostgreSQL tietokanta
   - Luo `.env` tiedosto juurihakemistoon:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=harjoittelupaikat
   DB_USER=käyttäjänimi
   DB_PASSWORD=salasana
   ```

4. **Luo tietokantataulut:**
   ```sql
   -- Käyttäjätaulu
   CREATE TABLE users (
     user_id SERIAL PRIMARY KEY,
     user_email VARCHAR(255) UNIQUE NOT NULL,
     user_password VARCHAR(255) NOT NULL,
     user_name VARCHAR(255),
     user_role INTEGER NOT NULL,
     student_id INTEGER,
     password_reset BOOLEAN DEFAULT false
   );

   -- Opiskelijataulu
   CREATE TABLE students (
     student_id SERIAL PRIMARY KEY,
     nimi VARCHAR(255) NOT NULL,
     sukunimi VARCHAR(255) NOT NULL,
     ryhma VARCHAR(255)
   );

   -- Yritystentaulu
   CREATE TABLE companies (
     company_id SERIAL PRIMARY KEY,
     company_name VARCHAR(255) NOT NULL,
     count_place INTEGER,
     tunnus VARCHAR(255),
     address VARCHAR(255)
   );

   -- Harjoittelupaikkojen taulu
   CREATE TABLE workplace (
     row_id SERIAL PRIMARY KEY,
     student_id INTEGER REFERENCES students(student_id),
     company_id INTEGER REFERENCES companies(company_id),
     ohjaaja VARCHAR(255),
     puhelin VARCHAR(255),
     email VARCHAR(255),
     alku DATE,
     loppu DATE,
     ruokaraha BOOLEAN,
     kaupunki VARCHAR(255),
     status VARCHAR(255)
   );
   ```

5. **Käynnistä sovellus:**
   ```bash
   npm start
   ```

6. **Avaa selaimessa:**
   ```
   http://localhost:3000
   ```


##  Tekijät

- **ILikhacheva** - *Projektin pääkehittäjä* - [GitHub](https://github.com/ILikhacheva)
