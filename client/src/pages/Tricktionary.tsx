import { trick } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Trictionary() {
  const [tricks, setTricks] = useState<trick[]>([]);

  useEffect(() => {
    fetch('/api/tricks')
      .then(response => response.json())
      .then(tricks => setTricks(tricks));
  }, []);

  return (
    <>
      <h1>All Tricks</h1>
      <ul>
        {tricks.map(trick => (
          <li key={trick.name}>
            <Link to={"/tricks/" + trick.name}>{trick.name}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Trictionary;