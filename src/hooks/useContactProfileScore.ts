import { useMemo } from 'react';
import { Contact } from '@/types/Contact';
import { validateEmail, validatePhone } from '@/utils/validation';

interface ContactScoreCategory {
  name: string;
  points: number;
  maxPoints: number;
  completedFields: string[];
  missingFields: string[];
}

interface ContactProfileScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'excellent';
  color: string;
  categories: ContactScoreCategory[];
  totalCompleted: number;
  totalFields: number;
}

export const useContactProfileScore = (contact: Contact | null): ContactProfileScore => {
  return useMemo<ContactProfileScore>(() => {
    if (!contact) {
      return {
        score: 0,
        level: 'low',
        color: 'hsl(var(--destructive))',
        categories: [],
        totalCompleted: 0,
        totalFields: 0,
      };
    }

    const categories: ContactScoreCategory[] = [];

    // 1. Canales/Consent (20 puntos)
    const canalesCategory: ContactScoreCategory = {
      name: 'Canales/Consentimiento',
      points: 0,
      maxPoints: 20,
      completedFields: [],
      missingFields: [],
    };

    const canalesFields = [
      { field: 'consent_email', label: 'Consentimiento email', points: 7 },
      { field: 'consent_whatsapp', label: 'Consentimiento WhatsApp', points: 7 },
      { field: 'channel_pref', label: 'Preferencia de canal', points: 6 },
    ];

    canalesFields.forEach(({ field, label, points }) => {
      if (contact[field as keyof Contact]) {
        canalesCategory.completedFields.push(label);
        canalesCategory.points += points;
      } else {
        canalesCategory.missingFields.push(label);
      }
    });

    categories.push(canalesCategory);

    // 2. Classification (15 puntos)
    const classificationCategory: ContactScoreCategory = {
      name: 'Clasificación',
      points: 0,
      maxPoints: 15,
      completedFields: [],
      missingFields: [],
    };

    const classificationFields = [
      { field: 'classification', label: 'Clasificación', points: 8 },
      { field: 'role_simple', label: 'Rol simple', points: 7 },
    ];

    classificationFields.forEach(({ field, label, points }) => {
      if (contact[field as keyof Contact]) {
        classificationCategory.completedFields.push(label);
        classificationCategory.points += points;
      } else {
        classificationCategory.missingFields.push(label);
      }
    });

    categories.push(classificationCategory);

    // 3. Interés/Capacidad (25 puntos)
    const interestCategory: ContactScoreCategory = {
      name: 'Interés/Capacidad',
      points: 0,
      maxPoints: 25,
      completedFields: [],
      missingFields: [],
    };

    const interestFields = [
      { field: 'interest', label: 'Interés', points: 8 },
      { field: 'ticket_min', label: 'Ticket mínimo', points: 5 },
      { field: 'ticket_max', label: 'Ticket máximo', points: 5 },
      { field: 'investment_capacity_min', label: 'Capacidad inversión mín.', points: 4 },
      { field: 'investment_capacity_max', label: 'Capacidad inversión máx.', points: 3 },
    ];

    interestFields.forEach(({ field, label, points }) => {
      if (contact[field as keyof Contact]) {
        interestCategory.completedFields.push(label);
        interestCategory.points += points;
      } else {
        interestCategory.missingFields.push(label);
      }
    });

    categories.push(interestCategory);

    // 4. Geo/Sector (20 puntos)
    const geoSectorCategory: ContactScoreCategory = {
      name: 'Geo/Sector',
      points: 0,
      maxPoints: 20,
      completedFields: [],
      missingFields: [],
    };

    const geoSectorFields = [
      { field: 'geography_focus', label: 'Foco geográfico', points: 10, isArray: true },
      { field: 'sectors_focus', label: 'Sectores de interés', points: 10, isArray: true },
    ];

    geoSectorFields.forEach(({ field, label, points, isArray }) => {
      const value = contact[field as keyof Contact];
      if (isArray ? (Array.isArray(value) && value.length > 0) : value) {
        geoSectorCategory.completedFields.push(label);
        geoSectorCategory.points += points;
      } else {
        geoSectorCategory.missingFields.push(label);
      }
    });

    categories.push(geoSectorCategory);

    // 5. Idioma/Timezone (10 puntos)
    const localeCategory: ContactScoreCategory = {
      name: 'Idioma/Zona horaria',
      points: 0,
      maxPoints: 10,
      completedFields: [],
      missingFields: [],
    };

    const localeFields = [
      { field: 'language_preference', label: 'Idioma preferido', points: 5 },
      { field: 'time_zone', label: 'Zona horaria', points: 5 },
    ];

    localeFields.forEach(({ field, label, points }) => {
      if (contact[field as keyof Contact]) {
        localeCategory.completedFields.push(label);
        localeCategory.points += points;
      } else {
        localeCategory.missingFields.push(label);
      }
    });

    categories.push(localeCategory);

    // 6. Email/Teléfono válido (10 puntos)
    const validationCategory: ContactScoreCategory = {
      name: 'Contacto válido',
      points: 0,
      maxPoints: 10,
      completedFields: [],
      missingFields: [],
    };

    if (contact.email && validateEmail(contact.email)) {
      validationCategory.completedFields.push('Email válido');
      validationCategory.points += 5;
    } else {
      validationCategory.missingFields.push('Email válido');
    }

    if (contact.phone && validatePhone(contact.phone)) {
      validationCategory.completedFields.push('Teléfono válido');
      validationCategory.points += 5;
    } else {
      validationCategory.missingFields.push('Teléfono válido');
    }

    categories.push(validationCategory);

    // Calculate totals
    const totalPoints = categories.reduce((sum, cat) => sum + cat.points, 0);
    const score = Math.round(totalPoints);
    const totalCompleted = categories.reduce((sum, cat) => sum + cat.completedFields.length, 0);
    const totalFields = categories.reduce((sum, cat) => sum + cat.completedFields.length + cat.missingFields.length, 0);

    // Determine level and color
    let level: 'low' | 'medium' | 'high' | 'excellent';
    let color: string;

    if (score >= 85) {
      level = 'excellent';
      color = 'hsl(var(--success))';
    } else if (score >= 70) {
      level = 'high';
      color = 'hsl(var(--warning))';
    } else if (score >= 50) {
      level = 'medium';
      color = 'hsl(38 92% 48%)';
    } else {
      level = 'low';
      color = 'hsl(var(--destructive))';
    }

    return {
      score,
      level,
      color,
      categories,
      totalCompleted,
      totalFields,
    };
  }, [contact]);
};