import { trick } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Trick() {
  let params = useParams();
  const [trick, setTrick] = useState<trick>();
  const tutorial = trick?.tutorial ?`https://youtube.com/embed/${trick.tutorial.substring(trick.tutorial.indexOf("?v=") + 3)}` : undefined

  useEffect(() => {
    fetch(`/api/tricks/${params.name}`)
      .then(response => response.json())
      .then(trick => setTrick(trick));
  }, []);

  return (
    <>
      <h1>
        {params.name}
      </h1>
      <video src={trick?.example_video ?? ""} hidden={trick?.example_video === null || trick?.example_video === null} controls/>
      <iframe width="560" height="315" src={tutorial ?? ""} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" hidden={trick?.tutorial === null || trick?.tutorial === undefined}></iframe>
    </>
  )
}

export default Trick;