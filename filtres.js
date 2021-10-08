var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var imgd;
var pix;

var tr = new Array(width).fill().map(() => Array(height));
var tg = new Array(width).fill().map(() => Array(height));
var tb = new Array(width).fill().map(() => Array(height));
var ta = new Array(width).fill().map(() => Array(height));

// Première capture
setTimeout(function(){ 
    TakeNewPicture();
}, 1000);

function BeforeProcessing() 
{
    x = 0;
    y = 0;
    width = canvas.width;
    height = canvas.height;

    imgd = context.getImageData(x, y, width, height);
    pix = imgd.data;

    // Copie des valeurs du tableau 1D vers le tableau 2D
    for (var y = 0; y < height; y++) { 
        for (var x = 0; x < width; x++) {
            tr[x][y] = pix[x*4+y*(width*4)+0];
            tg[x][y] = pix[x*4+y*(width*4)+1];
            tb[x][y] = pix[x*4+y*(width*4)+2];
            ta[x][y] = pix[x*4+y*(width*4)+3];
        }
    }
}

function AfterProcessing (photoID) 
{
    // Retransformer en tableau 1D
    for (var y = 0; y < height; y++) { 
        for (var x = 0; x < width; x++) {
            pix[x*4+y*(width*4)+0] = tr[x][y];
            pix[x*4+y*(width*4)+1] = tg[x][y];
            pix[x*4+y*(width*4)+2] = tb[x][y];
            pix[x*4+y*(width*4)+3] = ta[x][y];
        }
    }

    // Envoyer les donées vers l'image
    context.putImageData(imgd, 0, 0);
    
    var data = canvas.toDataURL('image/png');
    document.querySelector(photoID).setAttribute('src', data);
}

function FiltreContraste()
{
    TakeNewPicture();
    BeforeProcessing();

    // Histogrammes de chaques composantes
    let histRed = new Array(256).fill(0);
    let histGreen = new Array(256).fill(0);
    let histBlue = new Array(256).fill(0);

    // Nuances les plus élevées et les plus faibles
    var brighterRed = 0, brighterGreen = 0, brighterBlue = 0;
    var darkerRed = 0, darkerGreen = 0, darkerBlue = 0;

    // Remplissage des histogrammes et des valeurs extrémes
    for (var y = 0; y < height; y++)
    { 
        for (var x = 0; x < width; x++)
        {
            // Remplissage des histogrammes
            histRed[tr[x][y]]++;
            histGreen[tg[x][y]]++;
            histBlue[tb[x][y]]++;

            // Recherche du pixel le plus clair pour chaque composantes
            if(tr[x][y] > brighterRed) {
                brighterRed = tr[x][y];
            }
            if(tg[x][y] > brighterGreen) {
                brighterGreen = tg[x][y];
            }
            if(tb[x][y] > brighterBlue) {
                brighterBlue = tb[x][y];
            }
            
            // Recherche du pixel le plus sombre pour chaque composantes
            if(tr[x][y] < darkerRed) {
                darkerRed = tr[x][y];
            }
            if(tg[x][y] < darkerGreen) {
                darkerGreen = tg[x][y];
            }
            if(tb[x][y] < darkerBlue) {
                darkerBlue = tb[x][y];
            }
        }
    }

    // Histogrammes cumulés pour chaque composantes
    let cumlRed = new Array(256).fill(0);
    let cumlGreen = new Array(256).fill(0);
    let cumlBlue = new Array(256).fill(0);

    const N = width * height; // nombres de pixel dans l'image
    var memRed = 0, memGreen = 0, memBlue = 0; // mémoire temporaire pour le calcul des histogramme cumulés

    // Remplissage des histogrammes cumulés
    for (var n = 0; n < 255; n++)
    {
        cumlRed[n] = (histRed[n] / N) + memRed;
        memRed += histRed[n] / N;
        
        cumlGreen[n] = (histGreen[n] / N) + memGreen;
        memGreen += histGreen[n] / N;

        cumlBlue[n] = (histBlue[n] / N) + memBlue;
        memBlue += histBlue[n] / N;
    }

    var contrastLevel = document.getElementById("contrast-level").value;

    // Fonctio nde transfert
    for (var y = 0; y < height; y++)
    { 
        for (var x = 0; x < width; x++)
        {
            var r = cumlRed[tr[x][y]] * contrastLevel;
            var g = cumlGreen[tg[x][y]] * contrastLevel;
            var b = cumlBlue[tb[x][y]] * contrastLevel;

            tr[x][y] = r;
            tg[x][y] = g;
            tb[x][y] = b;
        }
    }

    PrintHist(histRed);
    
    AfterProcessing("#contraste-img");
}

function FiltreNegatif() 
{
    TakeNewPicture();
    BeforeProcessing();

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            tr[x][y] = 255 - tr[x][y];
            tg[x][y] = 255 - tg[x][y];
            tb[x][y] = 255 - tb[x][y];
        }
    }

    AfterProcessing("#negatif-img");
}

function FiltreBinarisation() 
{
    TakeNewPicture();
    BeforeProcessing();

    var inverse = document.getElementById("inverse-input").checked;

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var average = (tr[x][y] + tg[x][y] + tb[x][y]) / 3;

            if(inverse === true) // Permet simplement d'inverser le noir et le blanc
            {
                if(average < 128) 
                {
                    tr[x][y] = 0;
                    tg[x][y] = 0;
                    tb[x][y] = 0;
                }
                else 
                {
                    tr[x][y] = 255;
                    tg[x][y] = 255;
                    tb[x][y] = 255;   
                }
            }
            else
            {
                if(average < 128) 
                {
                    tr[x][y] = 255;
                    tg[x][y] = 255;
                    tb[x][y] = 255; 
                }
                else 
                {
                    tr[x][y] = 0;
                    tg[x][y] = 0;
                    tb[x][y] = 0; 
                }
            }

            
        }
    }

    AfterProcessing("#binarisation-img");
}

function FiltrePixelisation() 
{
    TakeNewPicture();
    BeforeProcessing();

    var pixelFactor = parseInt(document.getElementById("pixel-factor").value);

    for (var y = 0; y < height; y += pixelFactor) { 
        for (var x = 0; x < width; x += pixelFactor) {

            var r = tr[x][y];
            var g = tg[x][y];
            var b = tb[x][y];

            for(var px = 0; px < pixelFactor; px++) {
                for(var py = 0; py < pixelFactor; py++) {

                    if(((x + px) < width) && ((y + py) < height)) 
                    {
                        tr[x + px][y + py] = r;
                        tg[x + px][y + py] = g;
                        tb[x + px][y + py] = b;
                    }
                }
            }
        }
    }

    AfterProcessing("#pixelisation-img");

}

function FiltreGris() 
{
    TakeNewPicture();
    BeforeProcessing();

    for (var y = 0; y < height; y++) { 
        for (var x = 0; x < width; x++) {
            var average = (tr[x][y] + tg[x][y] + tb[x][y]) / 3;

            tr[x][y] = average;
            tg[x][y] = average;
            tb[x][y] = average;
        }
    }

    AfterProcessing("#gris-img");
}

function FiltreMirroir()
{
    TakeNewPicture();
    BeforeProcessing();

    var middlePercent = parseInt(document.getElementById("middle-input").value) / 100;
    for (var y = 0; y < height; y++)
    { 
        for (var x = 0; x < width; x++)
        {
            if(x > (width * middlePercent))
            {
                var xOffset = Math.trunc(x - (width * middlePercent));
                if((x - (xOffset*2)) > 0 && (x - (xOffset*2)) < width) 
                {
                    tr[x][y] = tr[x - (xOffset*2)][y];
                    tg[x][y] = tg[x - (xOffset*2)][y];
                    tb[x][y] = tb[x - (xOffset*2)][y];
                }
                
            }
        }
    }

    AfterProcessing("#mirroir-img");

}

function FiltreTeinture()
{
    TakeNewPicture();
    BeforeProcessing();

    // Création channels du filtre
    var filtreRed = new Array(width).fill(new Array(height));
    var filtreGreen = new Array(width).fill(new Array(height));
    var filtreBlue = new Array(width).fill(new Array(height));

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            filtreRed[x][y] = 128;
            filtreGreen[x][y] = 0;
            filtreBlue[x][y] = 128;
        }
    }

    var k = parseInt(document.getElementById("teinture-input").value) / 100;

    // Remplissage channels filtre
    for (var x = 0; x < width; x++)
    {
        for (var y = 0; y < height; y++)
        {
            // Interpolation linéaire : a + (b -a ) * x
            tr[x][y] = tr[x][y] + (filtreRed[x][y] - tr[x][y]) * k;
            tg[x][y] = tg[x][y] + (filtreGreen[x][y] - tg[x][y]) * k;
            tb[x][y] = tb[x][y] + (filtreBlue[x][y] - tb[x][y]) * k;
        }
    }

    AfterProcessing("#teinture-img");

}

// Afficher l'histogramme du filtre contraste
function PrintHist(histogrammeRed)
{
    const ctx = document.getElementById('histogram').getContext('2d');

    var histLabels = new Array(255).fill("");
    var histData = new Array(255).fill(0);
    var offset = 0;
    for(var i = 0; i < 255; i++)
    {
        if(offset === 0) 
        {
            histLabels[i] = i;
            offset = 50;
        }
        offset--;

        histData[i] = histogrammeRed[i];
    }

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: histLabels,
            datasets: [{
            label: 'Histogramme du channel rouge',
            data: histData,
            backgroundColor: 'red',
        }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        max: 255,
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 20,
                    }
                }]
            }
        }
    });
}

function TakeNewPicture() 
{
    TakePicture();

    BeforeProcessing();
    setTimeout(function(){ 
        let histRed = new Array(256).fill(0);
        for (var y = 0; y < height; y++)
        { 
            for (var x = 0; x < width; x++)
            {
                histRed[tr[x][y]]++;
            }
        }
        PrintHist(histRed);
    }, 3000);
    
}