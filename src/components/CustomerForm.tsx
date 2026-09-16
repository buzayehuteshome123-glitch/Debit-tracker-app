import React, { useState } from 'react';
import { View } from 'react-native';
import { FormField } from './FormField';
import { Button } from './Button';
import { useLocale } from '../i18n/LocaleProvider';
import { validateCustomerName } from '../business/balance';
import { spacing } from '../theme';

export interface CustomerFormValues {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface CustomerFormProps {
  initialValues?: CustomerFormValues;
  submitLabel: string;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

export function CustomerForm({ initialValues, submitLabel, onSubmit }: CustomerFormProps) {
  const { t } = useLocale();
  const [name, setName] = useState(initialValues?.name ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const validation = validateCustomerName(name);
    if (!validation.valid) {
      setNameError(t(validation.errorKey));
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      await onSubmit({ name, phone, address, notes });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <FormField
        label={`${t('customer_name')} *`}
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        placeholder={t('customer_name')}
        autoFocus={!initialValues}
      />
      <FormField
        label={`${t('phone_number')} (${t('optional')})`}
        value={phone}
        onChangeText={setPhone}
        placeholder="09XX XXX XXX"
        keyboardType="phone-pad"
      />
      <FormField
        label={`${t('address')} (${t('optional')})`}
        value={address}
        onChangeText={setAddress}
        placeholder={t('address')}
      />
      <FormField
        label={`${t('notes')} (${t('optional')})`}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('notes')}
        multiline
        numberOfLines={3}
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <View style={{ marginTop: spacing.sm }}>
        <Button label={submitLabel} onPress={handleSubmit} loading={saving} />
      </View>
    </View>
  );
}
