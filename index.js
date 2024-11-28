import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',      
    user: 'root',  
    password: 'pakpahan123',
    database: 'skolla_intern_test',
  });

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://dapo.kemdikbud.go.id/sp/3/370122');

    const jenjangOptions = await page.evaluate(() => {
      const selectElement = document.getElementById('selectJenjang');
      return Array.from(selectElement.options)
        .filter(option => option.value)
        .map(option => ({
          value: option.value,
          text: option.textContent.trim(),
        }));
    });

    console.log('Jenjang Options:', jenjangOptions);

    for (const jenjang of jenjangOptions) {
      console.log(`Mengambil data untuk jenjang: ${jenjang.text}`);

      await page.select('#selectJenjang', jenjang.value);

      await page.waitForSelector('.data.odd', { timeout: 10000 }).catch(() => {
        console.warn(`Data tidak ditemukan untuk jenjang: ${jenjang.text}`);
        return;
      });

      // Lakukan scraping data
      const schoolData = await page.evaluate(() => {
        const rows = document.querySelectorAll('tr.data');
        return Array.from(rows).map(row => {
          const columns = row.querySelectorAll('td');

          const lastSyncText = columns[5]?.innerText.trim() || '';
          const lastSyncDate = new Date(lastSyncText);
          const lastSync = isNaN(lastSyncDate.getTime()) ? null : lastSyncDate.toISOString();

          return {
            school_name: columns[1]?.innerText.trim() || '',
            npsn_id: parseInt(columns[2]?.innerText.trim() || '0'),
            bp: columns[3]?.innerText.trim() || '',
            status: columns[4]?.innerText.trim() || '',
            last_sync: lastSync,
            students: parseInt(columns[6]?.innerText.trim() || '0'),
            province: 'South Papua',
            subdistrict: 'Kontuar',
          };
        });
      });

      console.log(`Data untuk jenjang ${jenjang.text}:`, schoolData);

      for (const school of schoolData) {
        await connection.execute(
          `INSERT INTO school_data_fredrik 
          (school_name, npsn_id, bp, status, last_sync, students, province, subdistrict) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            school.school_name,
            school.npsn_id,
            school.bp,
            school.status,
            school.last_sync,
            school.students,
            school.province,
            school.subdistrict,
          ]
        );
      }

      console.log(`Data berhasil disimpan untuk jenjang: ${jenjang.text}`);
    }

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
})();
