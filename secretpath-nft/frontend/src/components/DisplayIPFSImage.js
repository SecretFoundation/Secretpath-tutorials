import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DisplayIPFSImage({ ipfsHash }) {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);
        const data = response.data;
       
        if (data.image) {
          setImageData(data.image);
        } else {
          console.error('No image data found in the IPFS JSON');
        }
      } catch (error) {
        console.error('Error fetching IPFS data:', error);
      }
    };

    if (ipfsHash) {
      fetchImageData();
    }
  }, [ipfsHash]);

  return (
    <div>
      {imageData ? (
       
       
        <img src={imageData} alt="IPFS Image" style={{ maxWidth: '100%' }} />
      
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
}

