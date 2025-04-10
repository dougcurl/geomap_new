import Legend from 'https://js.arcgis.com/4.32/@arcgis/core/widgets/Legend.js';

export async function setupLegend(view, legendLayers) {
    const mainLegend = new Legend({
        view: view,
        container: "gen_legendPanelDiv",
        layerInfos: legendLayers
    });

    return mainLegend;
}