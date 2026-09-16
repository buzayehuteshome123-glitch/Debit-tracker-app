import React from 'react';
import { View } from 'react-native';

// This tab is intercepted by a tabPress listener in the tabs layout and
// navigates to /pick-customer instead of ever rendering. The file must exist
// so expo-router has a route to attach the listener to.
export default function AddTabPlaceholder() {
  return <View />;
}
