import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

const currencies = ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'ARS', 'AUD', 'CHF'];

const currencyLabels = {
  USD: 'Dólar Americano',
  BRL: 'Real Brasileiro',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  JPY: 'Iene Japonês',
  CAD: 'Dólar Canadense',
  ARS: 'Peso Argentino',
  AUD: 'Dólar Australiano',
  CHF: 'Franco Suíço',
};

const API_URL = 'https://open.er-api.com/v6/latest/USD';

export default function App() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchRates = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Erro ao buscar taxas de câmbio');
        }

        const data = await response.json();

        if (!data?.rates) {
          throw new Error('Resposta da API inválida');
        }

        if (isMounted) {
          setRates({ USD: 1, ...data.rates });
        }
      } catch (err) {
        if (isMounted) {
          setError('Não foi possível carregar as taxas. Tente novamente mais tarde.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, []);

  const convertedValue = useMemo(() => {
    const numericAmount = Number.parseFloat(amount) || 0;

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return 0;
    }

    return ((numericAmount / rates[fromCurrency]) * rates[toCurrency]);
  }, [amount, fromCurrency, rates, toCurrency]);

  const exchangeRate = useMemo(() => {
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return 0;
    }

    return rates[toCurrency] / rates[fromCurrency];
  }, [fromCurrency, rates, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Conversor de Moedas</Text>
          <Text style={styles.subtitle}>Cotação em tempo real</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Valor</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Digite o valor"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>De</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={fromCurrency}
              onValueChange={setFromCurrency}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              {currencies.map((currency) => (
                <Picker.Item
                  key={`from-${currency}`}
                  label={`${currency} - ${currencyLabels[currency]}`}
                  value={currency}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
            <Text style={styles.swapText}>Inverter moedas</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Para</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={toCurrency}
              onValueChange={setToCurrency}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              {currencies.map((currency) => (
                <Picker.Item
                  key={`to-${currency}`}
                  label={`${currency} - ${currencyLabels[currency]}`}
                  value={currency}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.resultLabel}>Resultado</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#60a5fa" style={styles.loader} />
          ) : (
            <>
              <Text style={styles.resultText}>
                {convertedValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: toCurrency,
                })}
              </Text>
              <Text style={styles.exchangeText}>
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#93c5fd',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    color: '#f8fafc',
    fontSize: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  pickerContainer: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 18,
    overflow: 'hidden',
  },
  picker: {
    color: '#f8fafc',
    backgroundColor: '#1f2937',
  },
  swapButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    marginBottom: 18,
    paddingVertical: 12,
  },
  swapText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  resultLabel: {
    color: '#bfdbfe',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  resultText: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  exchangeText: {
    color: '#93c5fd',
    fontSize: 14,
    marginBottom: 10,
  },
  loader: {
    marginTop: 18,
  },
  error: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    color: '#fee2e2',
    fontSize: 13,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
