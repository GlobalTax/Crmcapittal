import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare,
  X,
  ChevronUp
} from 'lucide-react';
import { Company } from '@/types/Company';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyFloatingActionsProps {
  company: Company;
  hasContacts?: boolean;
  onCall?: () => void;
  onEmail?: () => void;
  onQuickNote?: () => void;
  onCreateLead?: () => void;
}

export const CompanyFloatingActions = ({
  company,
  hasContacts = false,
  onCall,
  onEmail,
  onQuickNote,
  onCreateLead
}: CompanyFloatingActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            {/* Crear Lead */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Button
                onClick={() => onCreateLead && handleAction(onCreateLead)}
                className="w-12 h-12 rounded-full shadow-lg gap-2"
                title="Crear nuevo lead"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Quick Note */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => onQuickNote && handleAction(onQuickNote)}
                variant="outline"
                className="w-12 h-12 rounded-full shadow-lg"
                title="Añadir nota rápida"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Email - solo si hay contactos */}
            {hasContacts && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => onEmail && handleAction(onEmail)}
                  variant="outline"
                  className="w-12 h-12 rounded-full shadow-lg"
                  title="Enviar email"
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Call - solo si hay contactos */}
            {hasContacts && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => onCall && handleAction(onCall)}
                  variant="outline"
                  className="w-12 h-12 rounded-full shadow-lg"
                  title="Realizar llamada"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating action button */}
      <Button
        onClick={toggleExpanded}
        className="w-14 h-14 rounded-full shadow-lg"
        size="lg"
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};