import React, { useState } from 'react';

export const VerificarManual = () => {
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de verificação de CPF e matrícula
    console.log('Verificando com CPF:', cpf, 'e Matrícula:', matricula);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Verificar Manualmente</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-lg font-medium mb-1">CPF:</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-1">Matrícula:</label>
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Digite a Matrícula"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Verificar
        </button>
      </form>
    </div>
  );
};
