import React, { useEffect, useState } from "react";
import { useSelector } from "../app/hooks";
import { accessTokenSelector } from "../app/selectors";
import { attendanceStats } from "../utils/nearbyComps";

export const TestView = () => {
  const [comps, setComps] = useState([] as any);
  const wcaAccessToken = useSelector(accessTokenSelector);

  useEffect(() => {
    if (!wcaAccessToken) {
      return;
    }

    const thing = async () => {
      const rawComps = await attendanceStats(wcaAccessToken);
      const picked = rawComps.map(
        ({ id, name, competitor_limit, numCompetitors }: any) => ({
          id,
          name,
          competitor_limit,
          numCompetitors,
        })
      );
      setComps(picked);
    };
    thing();
  }, [wcaAccessToken]);
  return (
    <div>
      {comps.length}, {JSON.stringify(comps)}
    </div>
  );
};
