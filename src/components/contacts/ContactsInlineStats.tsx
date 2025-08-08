import * as React from 'react';
import { Contact } from '@/types/Contact';

interface ContactsInlineStatsProps {
  contacts: Contact[];
  onStatClick?: (filter: string) => void;
}

export const ContactsInlineStats = ({ contacts, onStatClick }: ContactsInlineStatsProps) => {
  const totalContacts = contacts.length;
  
  const activeThisWeek = contacts.filter(contact => {
    if (!contact.last_contact_date) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(contact.last_contact_date) >= weekAgo;
  }).length;

  const newContacts = contacts.filter(contact => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(contact.created_at) >= weekAgo;
  }).length;

  const vipContacts = contacts.filter(contact => 
    contact.contact_priority === 'high' || contact.tags_array?.includes('VIP')
  ).length;

  return (
    <div className="text-sm text-slate-600 mb-4">
      <button 
        onClick={() => onStatClick?.('all')}
        className="hover:text-slate-800 transition-colors"
      >
        {totalContacts} contactos
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('active')}
        className="hover:text-slate-800 transition-colors"
      >
        {activeThisWeek} activos esta semana
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('new')}
        className="hover:text-slate-800 transition-colors"
      >
        {newContacts} nuevos
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('vip')}
        className="hover:text-slate-800 transition-colors"
      >
        {vipContacts} VIPs
      </button>
    </div>
  );
};