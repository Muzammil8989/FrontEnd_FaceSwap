import React, { useState } from 'react';

const FaceSwap = () => {
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [swapImage, setSwapImage] = useState<File | null>(null);
  const [result, setResult] = useState<{ targetImageUrl: string; swapImageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0] || null;
    setter(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!targetImage || !swapImage) {
      alert('Please upload both images.');
      return;
    }

    const formData = new FormData();
    formData.append('targetImage', targetImage);
    formData.append('swapImage', swapImage);

    setLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setResult(result); // Update result state with the uploaded URLs
      } else {
        console.error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <h1>Face Swap AI</h1>
      <form
        onSubmit={handleSubmit}
        id="uploadForm"
        style={{ margin: '2rem auto', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <label htmlFor="targetImage">Upload Target Image:</label>
          <input type="file" id="targetImage" accept="image/*" onChange={(e) => handleFileChange(e, setTargetImage)} />
        </div>
        <div>
          <label htmlFor="swapImage">Upload Swap Image:</label>
          <input type="file" id="swapImage" accept="image/*" onChange={(e) => handleFileChange(e, setSwapImage)} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Swap Faces'}
        </button>
      </form>
      {result && (
        <div id="result" style={{ marginTop: '2rem' }}>
          <h3>Result</h3>
          <p>
            Target Image URL:{' '}
            <a href={result.targetImageUrl} target="_blank" rel="noopener noreferrer">
              {result.targetImageUrl}
            </a>
          </p>
          <p>
            Swap Image URL:{' '}
            <a href={result.swapImageUrl} target="_blank" rel="noopener noreferrer">
              {result.swapImageUrl}
            </a>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <img src={result.targetImageUrl} alt="Target Image" style={{ width: '150px', border: '1px solid #ccc' }} />
            <img src={result.swapImageUrl} alt="Swap Image" style={{ width: '150px', border: '1px solid #ccc' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceSwap;
