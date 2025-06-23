import { ConsultationRepository } from "@/src/Repositories/ConsultationRepository";
import { Consultation } from "@/src/models/Consultation";
import { DatabaseConnection } from "../database/database";


const repo = new ConsultationRepository();

export const generateFakeConsultations = () => {
    cleanConsultations();
  const fixedDates = [
    '2025-06-20T10:00:00.000Z', // 3 consultations ce jour
    '2025-06-21T14:30:00.000Z', // 2
    '2025-06-22T09:00:00.000Z', // 2
    '2025-06-23T08:00:00.000Z', // 1
    '2025-06-24T11:45:00.000Z', // 2
  ];

  const consultations = [];

  for (let i = 0; i < 10; i++) {
    const date = fixedDates[Math.floor(i / 2)];
    consultations.push(
      new Consultation({
        fileName: `consultation-${i + 1}.json`,
        data: JSON.stringify({ tension: 120 + i, poids: 65 + i }),
        synced: false,
        type_diabete: 'DT1',
        id_patient: 'P-66A0629A',
        id_fiche: `F-${i + 1}`,
        longitude: -1.543 + i * 0.01,
        latitude: 12.356 + i * 0.01,
        createdBy: 'offline-agent',
        createdAt: date,
        updatedAt: date,
      })
    );
  }

  repo.insertAll(consultations);
  console.log('10 consultations générées, certaines avec la même date.');
};


export const cleanConsultations = () => {
    repo.clean();
    console.log('Consultations supprimées.');
}
  



const db = DatabaseConnection.getInstance();

export const updateConsultationsDates = (): void => {
  const results = db.getAllSync(`SELECT id FROM consultations`);
  const now = new Date();

  for (const row of results) {
    // Exemple : on répartit les dates entre aujourd'hui et les 9 jours précédents
    const randomOffset = Math.floor(Math.random() * 10); // 0 à 9 jours
    const newDate = new Date(now);
    newDate.setDate(now.getDate() - randomOffset);

    const isoDate = newDate.toISOString();

    db.runSync(`UPDATE consultations SET createdAt = ? WHERE id = ?`, [isoDate, row.id]);
  }

  console.log(`✔️ ${results.length} consultations mises à jour avec une date aléatoire`);
}
