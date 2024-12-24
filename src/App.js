import React from 'react';
import PDFEditor from './components/PdfEditor';

const App = () => {
  const handleSave = async (templateContent) => {
    console.log('Template saved successfully:', templateContent);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Interactive PDF Editor</h1>
      <PDFEditor onSave={handleSave} />
    </div>
  );
};

export default App;
