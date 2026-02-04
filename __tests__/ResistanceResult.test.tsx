/**
 * Testy dla komponentu ResistanceResult
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ResistanceResult from '../components/ResistanceResult';

describe('ResistanceResult Component', () => {
  describe('Unit formatting', () => {
    test('formats Ohms correctly', () => {
      const { getByText } = render(
        <ResistanceResult value={100} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/100Ω ±5%/)).toBeTruthy();
    });

    test('formats kilo-Ohms correctly', () => {
      const { getByText } = render(
        <ResistanceResult value={1000} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/1kΩ ±5%/)).toBeTruthy();
    });

    test('formats mega-Ohms correctly', () => {
      const { getByText } = render(
        <ResistanceResult value={1000000} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/1MΩ ±5%/)).toBeTruthy();
    });

    test('formats giga-Ohms correctly', () => {
      const { getByText } = render(
        <ResistanceResult value={1000000000} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/1GΩ ±5%/)).toBeTruthy();
    });

    test('fixes 102000 Ω to 102 kΩ', () => {
      const { getByText } = render(
        <ResistanceResult value={102000} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/102kΩ ±5%/)).toBeTruthy();
    });

    test('removes trailing zeros after decimal', () => {
      const { getByText } = render(
        <ResistanceResult value={10200} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/10.2kΩ ±5%/)).toBeTruthy();
    });

    test('handles floating point errors', () => {
      const { getByText } = render(
        <ResistanceResult value={10.200000000001} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/10.2Ω ±5%/)).toBeTruthy();
    });
  });

  describe('Tolerance display', () => {
    test('shows tolerance when provided', () => {
      const { getByText } = render(
        <ResistanceResult value={1000} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/±5%/)).toBeTruthy();
    });

    test('hides tolerance when null', () => {
      const { queryByText } = render(
        <ResistanceResult value={1000} tolerance={null} tempCoeff={null} />
      );
      expect(queryByText(/±/)).toBeNull();
    });
  });

  describe('Temperature coefficient display', () => {
    test('shows temp coefficient when provided', () => {
      const { getByText } = render(
        <ResistanceResult value={1000} tolerance={5} tempCoeff={100} />
      );
      expect(getByText(/100ppm\/°C/)).toBeTruthy();
    });

    test('hides temp coefficient when null', () => {
      const { queryByText } = render(
        <ResistanceResult value={1000} tolerance={5} tempCoeff={null} />
      );
      expect(queryByText(/ppm/)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    test('handles zero value', () => {
      const { getByText } = render(
        <ResistanceResult value={0} tolerance={null} tempCoeff={null} />
      );
      expect(getByText(/0Ω/)).toBeTruthy();
    });

    test('handles very large values', () => {
      const { getByText } = render(
        <ResistanceResult value={999999999999} tolerance={null} tempCoeff={null} />
      );
      expect(getByText(/GΩ/)).toBeTruthy();
    });

    test('handles decimal values', () => {
      const { getByText } = render(
        <ResistanceResult value={4.7} tolerance={5} tempCoeff={null} />
      );
      expect(getByText(/4.7Ω ±5%/)).toBeTruthy();
    });
  });
});

