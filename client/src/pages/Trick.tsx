import { trick } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Trick() {
  let params = useParams();
  const [trick, setTrick] = useState<trick>();

  // useEffect(() => {
  //   fetch('/api/trick/')
  //     .then(response => response.json())
  //     .then(tricks => setTricks(tricks));
  // }, []);

  return (
    <>
      <h1>
        {params.name}
      </h1>
    </>
  )
}

export default Trick;