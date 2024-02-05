
export function getLabelData(facet, yScale){

    return facet.data.plotData
        .map(({ areas, party, displayNameDesk, displayNameMob, altTextColor }) => {
        const average = areas[areas.length - 1].value;
        return {
            party,
            altTextColor,
            displayNameDesk,
            displayNameMob,
            average,
            // Set initial positions for each label
            position: yScale(average),
        };
        })
        .sort((a, b) => b.average - a.average);
}