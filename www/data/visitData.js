// id:[name,status,link,price]
var visitDataArray = [
[1951385562,"Bert's bar","done","/2013/07/30/1-berts-bar-william-street-edinburgh/",3.60],
[1427181454,"Teuchters","done","/2013/07/30/2-teuchters-william-street-edinburgh/",3.80],
[2075163263,"Melville","done","/2013/07/30/3-the-melville-william-street-edinburgh/",3.40],
[1558442818,"Mathers Bar","done","/2013/07/30/4-mathers-bar-queensferry-street-edinburgh/",3.20],
[2325384958,"Ryan's Bar","done","/2013/07/30/5-ryans-bar-hope-street-edinburgh/",3.56],
[1558442819,"Angels Share","done","/2013/07/30/6-angels-share-hope-street-edinburgh/",0.00],
[333159410,"The Cask and Barrel","done","/2013/08/06/7-cask-and-barrel-broughton-street-edinburgh/",0.00],
[663451599,"The Bellevue","done","/2013/08/06/8-the-bellevue-london-street-edinburgh/",0.00],
[1608938029,"The Barony Bar","done","/2013/08/06/9-barony-bar-broughton-street-edinburgh/",0.00],
[1968533745,"The Phoenix","done","/2013/08/06/10-phoenix-bar-broughton-street-edinburgh/",0.00],
[1327630111,"The Basement","done","/2013/08/06/11-the-basement-broughton-street-edinburgh/",0.00],
[1437376909,"Conan Doyle","done","/2013/08/06/12-the-conan-doyle-york-place-edinburgh/",0.00],
[3014805286,"The Holyrood 9A","done","/2013/08/14/13-the-holyrood-9a-holyrood-road-edinburgh/",0.00],
[474025625,"Pleasance","done","/2013/08/18/14-the-pleasance-bar-the-pleasance-edinburgh/",0.00],
[2110838419,"Ghillie-Dhu","done","/2013/08/18/15-ghillie-dhu-rutland-place-edinburgh/",0.00],
[1864889446,"Au Bar","done","/2013/08/19/16-au-bar-shandwick-place-edinburgh/",0.00],
[1977943406,"The Grosvenor","done","/2013/08/21/17-the-grosvenor-shandwick-place-edinburgh/",0.00],
[1434403669,"The Huxley","done","/2013/08/21/18-the-huxley-rutland-place-edinburgh/",0.00],
[705826908,"The Westroom","done","/2013/08/21/19-the-westroom-melville-place-edinburgh/",0.00],
[2073217320,"52 Canoes Tiki Den","done","/2013/08/21/20-52-canoes-tiki-den-melville-place-edinburgh/",0.00],
[705831581,"Haymarket","done","/2013/08/22/21-the-haymarket-bar-west-maitland-street-edinburgh/",0.00],
[2188447325,"The Spiders Web","done","/2013/08/22/22-the-spiders-web-morrison-street-edinburgh/",0.00],
[2072885332,"Mercat Bar","done","/2013/08/23/23-the-mercat-bar-west-maitland-street-edinburgh/",0.00],
[2341270807,"Diane's Pool Hall","done","/2013/08/26/24-dianes-pool-hall-morrison-street-edinburgh/",0.00],
[57543992,"Cumberland Bar","done","/2013/08/28/25-the-cumberland-bar-cumberland-street-edinburgh/",0.00],
[1608938041,"The Wally Dug","done","/2013/08/28/26-the-wally-dug-northumberland-street-edinburgh/",0.00],
[2095332792,"The Standard","done","/2013/08/29/27-the-standard-howe-street-edinburgh/",0.00],
[1951178520,"Thomson's Bar","done","/2013/09/05/28-thomsons-bar-morrison-street-edinburgh/",0.00],
[2425759993,"Priory","done","/2013/09/05/29-the-priory-morrison-street-edinburgh/",0.00],
[705831578,"Carters","done","/2013/09/07/30-carters-bar-morrison-street-edinburgh/",0.00],
[2112504111,"Lebowskis","done","/2013/09/08/31-lebowskis-morrison-street-edinburgh/",0.00],
[2177262557,"The Hanging Bat","done","/2013/09/10/33-the-hanging-bat-lothian-road-edinburgh/",0.00],
[2103111401,"Lock 25","done","/2013/09/10/34-lock-25-fountainbridge-edinburgh/",0.00],
[2293637169,"Cargo","done","/2013/09/11/35-cargo-fountainbridge-edinburgh/",0.00],
[2621234538,"Hyde Out","done","/2013/09/11/36-hyde-out-fountainbridge-square-edinburgh/",0.00],
[2344919701,"Clark's Bar","done","/2013/09/16/37-clarks-bar-dundas-street-edinburgh/",0.00],
[1608938020,"Kay's Bar","done","/2013/09/17/41-kays-bar-jamaica-street-edinburgh/",0.00],
[585214845,"Cross & Corner","done","/2013/09/16/38-cross-corner-canonmills-edinburgh/",0.00],
[585214846,"The Other Place","done","/2013/09/16/39-the-other-place-broughton-road-edinburgh/",0.00],
[685179762,"Smithie's Ale House","done","/2013/09/17/40-smithies-ale-house-eyre-place-edinburgh/",0.00],
[482432721,"Bennets Bar","done","/2013/10/06/42-bennetts-bar-leven-street-edinburgh/",0.00],
[2089192516,"The Blackbird","done","/2013/10/06/43-the-blackbird-leven-street-edinburgh/",0.00],
[2089338544,"Henricks Bar & Bistro","done","/2013/10/07/44-henricks-bar-barclay-place-edinburgh/",0.00],
[289343859,"The Golf Tavern","done","/2013/10/09/45-the-golf-tavern-wrights-houses-edinburgh/",0.00],
[499994553,"Links Bar","done","/2013/10/10/46-the-links-bar-alvanley-terrace-whitehouse-loan-edinburgh/",0.00],
[368877716,"Montpeliers","done","/2013/10/13/47-montpeliers-bruntsfield-place-edinburgh/",0.00],
[1558442814,"Whigham's Wine Cellars","done","/2013/10/15/48-whighams-wine-cellars-hope-street-edinburgh/",0.00],
[2109786401,"Shandwick's","done","/2013/10/16/49-shandwicks-south-charlotte-street-edinburgh/",0.00],
[295029147,"Alexander Graham Bell","done","/2013/10/19/50-the-alexander-graham-bell-george-street-edinburgh/",0.00],
[295029140,"George Street","done","/2013/10/20/51-george-street-bar-and-grill-george-street-edinburgh/",0.00],
[1367337816,"Abbotsford","done","/2013/10/23/52-the-abbotsford-rose-street-edinburgh/",0.00],
[41483872,"Milnes","done","/2013/10/23/53-milnes-rose-street-edinburgh/",0.00],
[1329619364,"Robertsons 37 Bar","done","/2013/10/23/54-robertsons-37-bar-rose-street-edinburgh/",0.00],
[41483863,"The Black Rose Tavern","done","/2013/10/23/55-the-black-rose-tavern-rose-street-edinburgh/",0.00],
[41483858,"Rose Street Brewery","done","/2013/10/26/56-the-rose-street-brewery-rose-street-edinburgh/",0.00],
[41483854,"Auld Hundred","done","/2013/10/26/57-auld-hundred-rose-street-edinburgh/",0.00],
[41483847,"The Kenilworth","done","/2013/10/28/58-the-kenilworth-rose-street-edinburgh/",0.00],
[2367011957,"International Vodka and Beer Bar","done","/2013/10/29/59-international-vodka-and-beer-bar-rose-street-north-lane-edinburgh/",0.00],
[41483843,"The Black Cat","done","/2013/10/30/60-the-black-cat-rose-street-edinburgh/",0.00],
[2127679448,"Amicus Apple","done","/2013/11/02/61-amicus-apple-frederick-street-edinburgh/",0.00],
[41483832,"Dirty Dicks","done","/2013/11/02/62-dirty-dicks-rose-street-edinburgh/",0.00],
[41483835,"Rose & Crown","done","/2013/11/02/63-the-rose-and-crown-rose-street-edinburgh/",0.00],
[41483839,"The Gordon Arms","done","/2013/11/02/64-the-gordon-arms-rose-street-edinburgh/",0.00],
[322777437,"Oxford Bar","done","/2013/11/03/65-the-oxford-bar-young-street-edinburgh/",0.00],
[2114321902,"Queen's Arms","done","/2013/11/05/66-queens-arms-frederick-street-edinburgh/",0.00],
[2343257903,"The Bon Vivant","done","/2013/11/05/67-the-bon-vivant-thistle-street-edinburgh/",0.00],
[418637797,"Thistle Street Bar","done","/2013/11/07/68-thistle-street-bar-thistle-street-edinburgh/",0.00],
[2100295795,"99 Hanover Street","done","/2013/11/07/69-99-hanover-street-hanover-street-edinburgh/",0.00],
[2112504091,"shakespeare","done","/2013/11/09/70-shakespeares-lothian-road-edinburgh/",0.00],
[1951378276,"Red Squirrel","done","/2013/11/09/71-red-squirrel-lothian-road-edinburgh/",0.00],
[1951380239,"All Bar One","done","/2013/11/09/72-all-bar-one-lothian-road-edinburgh/",0.00],
[483034256,"The Blue Blazer","done","/2013/11/09/73-blue-blazer-spittal-street-edinburgh/",0.00],
[634866813,"Footlights Bar & Grill","done","/2013/11/09/74-footlights-spittal-street-edinburgh/",0.00],
[2385912323,"Candy","done","/2013/11/15/75-candy-bar-george-street-edinburgh/",0.00],
[2100296334,"Tonic","done","/2013/11/16/76-tonic-north-castle-street-edinburgh/",0.00],
[2100296385,"Living Room","done","/2013/11/16/77-the-living-room-george-street-edinburgh/",0.00],
[41483825,"Scotts","done","/2013/11/16/78-scotts-rose-street-edinburgh/",0.00],
[1797492269,"Sygn","done","/2013/11/16/79-sygn-charlotte-lane-edinburgh/",0.00],
[913817636,"The Newsroom","done","/2013/11/17/80-the-newsroom-leith-street-edinburgh/",0.00],
[33185107,"Guildford Arms","done","/2013/11/17/81-the-guildford-arms-west-register-street-edinburgh/",0.00],
[1978359059,"Voodoo Rooms","done","/2013/11/17/82-the-voodoo-rooms-west-register-street-edinburgh/",0.00],
[57542915,"Cafe Royal","done","/2013/11/17/83-the-cafe-royal-bar-west-register-street-edinburgh/",0.00],
[1558431275,"Tiles Bar","done","/2013/11/17/84-tiles-saint-andrew-square-edinburgh/",0.00],
[2542270625,"Panda & Sons","done","/2013/11/21/85-panda-and-sons-queen-street-edinburgh/",0.00],
[322777306,"Cambridge Bar","done","/2013/11/23/86-the-cambridge-bar-young-street-edinburgh/",0.00],
[1558442817,"Element","done","/2013/11/23/87-element-rose-street-edinburgh/",0.00],
[2114339827,"Rick's","done","/2013/11/24/88-ricks-bar-frederick-street-edinburgh/",0.00],
[2542270112,"Lucky Liquor Co.","done","/2013/11/24/89-lucky-liquor-co-queen-street-edinburgh/",0.00],
[2341277531,"Kings Arms","done","/2013/11/28/90-kings-arms-home-street-edinburgh/",0.00],
[674682926,"Burlington Bertie","done","/2013/11/28/91-burlington-bertie-tarvit-street-edinburgh/",0.00],
[2089188356,"Cuckoo's Nest","done","/2013/11/29/92-the-cuckoos-nest-home-street-edinburgh/",0.00],
[2335634557,"The Ventoux","done","/2013/12/01/93-the-ventoux-brougham-street-edinburgh/",0.00],
[2338302328,"Cloisters Bar","done","/2013/12/01/94-cloisters-bar-brougham-street-edinburgh/",0.00],
[511213047,"The Malt Shovel","done","/2013/12/05/95-the-malt-shovel-cockburn-street-edinburgh/",0.00],
[2931382078,"The Halfway House","done","/2013/12/12/99-halfway-house-fleshmarket-close-edinburgh/",0.00],
[2339860706,"Jake's Place","done","/2013/12/08/96-jakes-place-market-street-edinburgh/",0.00],
[2555487974,"Devil's Advocate","done","/2013/12/08/97-the-devils-advocate-advocates-close-edinburgh/",0.00],
[1558430340,"Doric Bar","done","/2013/12/09/98-the-doric-market-street-edinburgh/",0.00],
[2338726779,"Ensign Ewart","done","/2013/12/15/100-ensign-ewart-lawnmarket-edinburgh/",0.00],
[736215229,"Deacon Brodie's Tavern","done","/2013/12/15/101-deacon-brodies-lawnmarket-edinburgh/",0.00],
[639106656,"The Albanach","done","/2013/12/16/102-the-albanach-high-street-edinburgh/",0.00],
[1369539068,"Scotsman's Lounge","done","/2013/12/17/103-scotsmans-lounge-cockburn-street-edinburgh/",0.00],
[613227823,"Doctors","done","/2013/12/28/104-doctors-forrest-road-edinburgh/",0.00],
[1770134132,"Bristo","done","/2013/12/28/105-bristo-bar-kitchen-lothian-street-edinburgh/",0.00],
[2089200146,"Malones","done","/2013/12/29/106-malones-forrest-road-edinburgh/",0.00],
[1951680695,"Sandy Bell's","done","/2013/12/30/107-sandy-bells-forrest-road-edinburgh/",0.00],
[474049045,"The Brauhaus","done","/2014/01/01/108-brauhaus-lauriston-place-edinburgh/",0.00],
[2324955570,"The Southern","done","/2014/01/06/109-the-southern-south-clerk-street-edinburgh/",0.00],
[1319348485,"Cask & Barrel Southside","done","/2014/01/08/110-cask-and-barrel-south-side-west-preston-street-edinburgh/",0.00],
[504318323,"Drouthy Neebors","done","/2014/01/08/111-drouthy-neebors-west-preston-street-edinburgh/",0.00],
[2218425854,"The Royal Dick","done","/2014/01/08/112-the-royal-dick-summerhall-edinburgh/",0.00],
[366191857,"Dagda","done","/2014/01/08/113-the-dagda-bar-buccleuch-street-edinburgh/",0.00],
[2335634621,"The Grapes","done","/2014/01/14/114-the-grapes-clerk-street-edinburgh/",0.00],
[100871335,"The Abbey","done","/2014/01/15/115-the-abbey-south-clerk-street-edinburgh/",0.00],
[248681867,"McSorleys","done","/2014/01/18/116-mcsorleys-clerk-street-edinburgh/",0.00],
[507247282,"Greenmantle","done","/2014/01/19/117-the-green-mantle-nicolson-street-edinburgh/",0.00],
[366190983,"Blind Poet","done","/2014/01/22/118-the-blind-poet-west-nicolson-street-edinburgh/",0.00],
[910426589,"Counting House","done","/2014/01/22/119-the-counting-house-west-nicolson-street-edinburgh/",0.00],
[366190942,"Pear Tree","done","/2014/01/22/120-the-peartree-west-nicolson-street-edinburgh/",0.00],
[366191034,"56 North","done","/2014/01/25/121-56-north-west-crosscauseway-edinburgh/",0.00],
[366191902,"The Meadow Bar","done","/2014/01/25/122-the-meadow-bar-buccleuch-street-edinburgh/",0.00],
[734668069,"The Potting Shed","done","/2014/01/26/123-the-potting-shed-potterow-edinburgh/",0.00],
[585214834,"Hectors","done","/2014/01/29/124-hectors-deanhaugh-street-edinburgh/",0.00],
[585214835,"The Stockbridge Tap","done","/2014/01/29/125-the-stockbridge-tap-raeburn-place-edinburgh/",0.00],
[585214839,"St Bernards Bar","done","/2014/01/29/126-st-bernards-bar-raeburn-place-edinburgh/",0.00],
[727348525,"The Raeburn","done","/2014/02/03/127-the-raeburn-dean-street-edinburgh/",0.00],
[727348502,"The Bon Vivant Stockbridge","done","/2014/02/09/128-the-bon-vivant-stockbridge-dean-street-edinburgh/",0.00],
[2582018814,"Rollo","disqualified:restaurant","",0.00],
[2076668725,"The Scran & Scallie","done","/2014/02/09/129-scran-scallie-raeburn-place-edinburgh/",0.00],
[585214836,"Hamilton's Bar and Kitchen","done","/2014/02/09/130-hamiltons-bar-and-kitchen-hamilton-place-edinburgh/",0.00],
[585214840,"The Antiquary","done","/2014/02/09/131-the-antiquary-st-stephen-street-edinburgh/",0.00],
[307639901,"The Baillie","done","/2014/02/10/132-the-bailie-bar-st-stephen-street-edinburgh/",0.00],
[2343249681,"The Last Word","done","/2014/02/11/133-the-last-word-st-stephen-street-edinburgh/",0.00],
[658120548,"Wash Bar","done","/2014/02/12/134-wash-bar-north-bank-street-edinburgh/",0.00],
[2338727896,"The Jolly Judge","done","/2014/02/16/135-the-jolly-judge-james-court-edinburgh/",0.00],
[2338357475,"Bar Kohl","done","/2014/02/17/136-bar-kohl-george-iv-bridge-edinburgh/",0.00],
[2339288054,"Villager","done","/2014/02/17/137-villager-george-iv-bridge-edinburgh/",0.00],
[658120529,"Frankenstein","done","/2014/02/18/138-frankenstein-george-iv-bridge-edinburgh/",0.00],
[2073202200,"Harry's Bar","done","/2014/02/19/139-harrys-bar-randolph-place-edinburgh/",0.00],
[2126282232,"Indigo Yard","done","/2014/02/19/141-indigo-yard-charlotte-lane-edinburgh/",0.00],
[2126282231,"Le Di-Vin","done","/2014/02/19/140-le-di-vin-randolph-place-edinburgh/",0.00],
[2305497529,"The Caley Bar","done","/2014/02/19/142-the-caley-bar-rutland-street-edinburgh/",0.00],
[1977943407,"The Rat Pack","done","/2014/02/20/143-the-rat-pack-shandwick-place-edinburgh/",0.00],
[224262073,"Ryries","done","/2014/02/23/144-ryries-haymarket-terrace-edinburgh/",0.00],
[2338949040,"Dickens","done","/2014/02/23/145-dickens-dalry-road-edinburgh/",0.00],
[367085460,"The Fountain","done","/2014/02/23/146-the-fountain-dundee-street-edinburgh/",0.00],
[368877704,"McCowans","done","/2014/02/23/147-mccowans-dundee-street-edinburgh/",0.00],
[367085453,"The Golden Rule","done","/2014/02/23/148-the-golden-rule-yeaman-place-edinburgh/",0.00],
[367085451,"The Polwarth Tavern","done","/2014/02/24/149-the-polwarth-tavern-polwarth-crescent-edinburgh/",0.00],
[295032084,"The Standing Order","done","/2014/02/25/150-the-standing-order-george-street-edinburgh/",0.00],
[2100296075,"Grand Cru","done","/2014/02/26/151-grand-cru-hanover-street-edinburgh/",0.00],
[2345016950,"Bramble","done","/2014/02/26/152-bramble-queen-street-edinburgh/",0.00],
[2114384788,"Soba","done","/2014/02/26/153-soba-hanover-street-edinburgh/",0.00],
[2100295733,"Jekyll & Hyde","done","/2014/02/26/154-jekyll-hyde-hanover-street-edinburgh/",0.00],
[1367308785,"Fiddler's Arms","done","/2014/03/02/155-fiddlers-arms-grassmarket-edinburgh/",0.00],
[2338717872,"Black Bull","done","/2014/03/02/156-black-bull-grassmarket-edinburgh/",0.00],
[2338719696,"The Beehive Inn","done","/2014/03/02/157-the-beehive-inn-grassmarket-edinburgh/",0.00],
[2338720785,"The White Hart Inn","done","/2014/03/02/158-the-white-hart-inn-grassmarket-edinburgh/",0.00],
[2338722313,"Last Drop","done","/2014/03/02/159-the-last-drop-grassmarket-edinburgh/",0.00],
[2338722991,"Maggie Dickson's Pub","done","/2014/03/03/160-maggie-dicksons-grassmarket-edinburgh/",0.00],
[2338724156,"Biddy Mulligans","done","/2014/03/05/161-biddy-mulligans-and-the-wee-pub-grassmarket-edinburgh/",0.00],
[2643336693,"The Wee Pub","disqualified:Part of Biddy Mulligans","",0.00],
[2112474893,"Bar Salsa","done","/2014/03/05/162-bar-salsa-cowgatehead-edinburgh/",0.00],
[42556521,"Biblos","done","/2014/03/08/163-biblos-chambers-street-edinburgh/",0.00],
[2675696071,"Bar 50","done","/2014/03/08/164-bar-50-blackfriars-street-edinburgh/",0.00],
[2338749941,"Pilgrim","done","/2014/03/08/165-pilgrim-robertsons-close-edinburgh/",0.00],
[2338749883,"Bannerman's Bar","done","/2014/03/08/166-bannermans-cowgate-edinburgh/",0.00],
[2323807234,"Capital","done","/2014/03/08/167-capital-bar-cowgate-edinburgh/",0.00],
[2112426299,"Brew Dog","done","/2014/03/08/168-brewdog-cowgate-edinburgh/",0.00],
[483045947,"Three Sisters","done","/2014/03/12/169-the-three-sisters-cowgate-edinburgh/",0.00],
[483043342,"Opium","done","/2014/03/17/170-opium-cowgate-edinburgh/",0.00],
[1557683657,"Oz Bar","done","/2014/03/17/171-oz-bar-candlemaker-row-edinburgh/",0.00],
[2119041375,"Under the Stairs","done","/2014/03/17/172-under-the-stairs-merchant-street-edinburgh/",0.00],
[2338325445,"Espionage","done","/2014/04/06/173-espionage-victoria-street-edinburgh/",0.00],
[839139665,"The Tron","done","/2014/04/13/174-the-tron-hunter-square-edinburgh/",2.70],
[1369539066,"The City Cafe","done","/2014/04/13/175-the-city-cafe-blair-street-edinburgh/",3.60],
[2952627920,"Cafe Voltaire","done","/2014/04/14/176-cafe-voltaire-blair-street-edinburgh/",0.00],
[2323807241,"The Advocate","done","/2014/04/15/177-the-advocate-hunter-square-edinburgh/",0.00],
[2931382079,"The Jinglin' Geordie","done","/2014/04/16/178-the-jinglin-geordie-fleshmarket-close-edinburgh/",0.00],
[634806195,"The Chanter","done","/2014/05/05/179-the-chanter-bread-street-edinburgh",0.00],
[634806190,"Monboddo","done","/2014/05/05/180-monboddo-bread-street-edinburgh/",0.00],
[1951364889,"Timberyard","done","/2014/05/05/181-timberyard-lady-lawson-street-edinburgh/",0.00],
[2156953059,"Dragonfly","done","/2014/05/05/182-dragonfly-west-port-edinburgh/",0.00],
[2335634597,"Moriarty","done","/2014/05/05/183-moriarty-lothian-road-edinburgh/",0.00],
[33214208,"The International Bar","done","/2014/05/06/184-international-bar-brougham-place-edinburgh/",0.00],
[2089240094,"Cameo Bar","done","/2014/05/06/185-cameo-bar-lochrin-place-edinburgh/",0.00],
[669951446,"Bisque","done","/2014/05/06/186-bisque-bar-brasserie-bruntsfield-place-edinburgh/",0.00],
[2277391529,"Argyle Bar","done","/2014/05/06/187-argyle-bar-and-the-cellar-monkey-argyle-place-edinburgh/",0.00],
[2395932599,"Cellar Monkey","disqualified:Part of Argyle Bar","",0.00],
[1880546995,"The Earl of Marchmont","done","/2014/05/06/188-the-earl-of-marchmont-marchmont-crescent-edinburgh/",0.00],
[2710784484,"Clerk's Bar","done","/2014/05/10/189-clerks-bar-south-clerk-street-edinburgh/",3.95],
[345251451,"The Montague","done","/2014/05/10/190-the-montague-st-leonards-street-edinburgh/",3.17],
[255760161,"The Auld Hoose","done","/2014/05/10/191-the-auld-hoose-st-leonards-street-edinburgh/",0.00],
[507003510,"Jeanie Deans Tryste","done","/2014/05/11/192-jeanie-deans-tryste-st-leonards-hill-edinburgh/",0.00],
[570329678,"Southsider","done","/2014/05/11/193-the-southsider-west-richmond-street-edinburgh/",3.40],
[2155266405,"Captain's Bar","done","/2014/05/11/194-the-captains-bar-south-college-street-edinburgh/",0.00],
[1996125592,"The Brass Monkey","done","/2014/05/12/195-brass-monkey-drummond-street-edinburgh/",0.00],
[2338734297,"Greyfriars Bobby's Bar","done","/2014/05/12/196-greyfriars-bobby-candlemaker-row-edinburgh/",0.00],
[42861311,"Revolution","done","/2014/05/13/197-revolution-chambers-street-edinburgh/",0.00],
[42556535,"The Jazz Bar","disqualified:Pay to get in","",0.00],
[2426508097,"Rascals","done","/2014/05/14/198-rascals-south-bridge-edinburgh/",0.00],
[1369533379,"Joseph Pearce's","done","/2014/05/15/199-joseph-pearces-elm-row-edinburgh/",0.00],
[1249972539,"Jeremiah's Tap Room","done","/2014/05/16/200-jeremiahs-taproom-elm-row-edinburgh/",0.00],
[1962438314,"Planet","done","/2014/05/16/201-planet-baxters-place-edinburgh/",0.00],
[1437376910,"Theatre Royal","done","/2014/05/19/202-theatre-royal-greenside-place-edinburgh/",0.00],
[1437376911,"C.C. Blooms","done","/2014/05/19/203-cc-blooms-greenside-place-edinburgh/",0.00],
[732958018,"The Mitre","done","/2014/05/21/204-the-mitre-high-street-edinburgh/",0.00,"2014/04/01"],
[626986693,"The Royal Mile","done","/2014/05/22/205-the-royal-mile-tavern-high-street-edinburgh/",0.00,"2014/04/01"],
[249967014,"The Inn On The Mile","done","/2014/05/22/206-the-inn-on-the-mile-high-street-edinburgh/",0.00,"2014/04/01"],
[2112426253,"Whiski","done","/2014/05/25/207-whiski-bar-high-street-edinburgh/",0.00,"2014/04/01"],
[70955015,"No 1 High Street","done","/2014/05/26/208-no-1-high-street-high-street-edinburgh/",0.00,"2014/04/01"],
[2342800500,"Lord Bodo's Bar","closed:Closed, last checked 2014/04/08","",0.00,"2014/04/08"],
[1782941207,"New Town Bar","done","/2014/06/01/209-the-new-town-bar-dublin-street-edinburgh/",0.00,"2014/04/08"],
[2128258320,"Stac Polly","done","/2014/06/01/210-stac-polly-dublin-street-edinburgh/",0.00,"2014/04/08"],
[1707107356,"The Magnum","done","/2014/06/01/211-magnum-albany-street-edinburgh/",0.00,"2014/04/08"],
[1608938025,"Star Bar","done","/2014/06/02/212-star-bar-northumberland-place-edinburgh/",0.00,"2014/04/08"],
[2095332792,"Mother's","done","/2014/06/02/213-mothers-howe-street-edinburgh/",0.00,"2014/04/08"],
[1327629873,"The Street","done","/2014/06/02/214-the-street-picardy-place-edinburgh/",0.00,"2014/04/15"],
[1327629857,"Mathers","done","/2014/06/03/215-mathers-broughton-street-edinburgh/",0.00,"2014/04/15"],
[1108860713,"The Outhouse","done","/2014/06/04/216-the-outhouse-broughton-street-lane-edinburgh/",0.00,"2014/04/15"],
[2413993978,"Bangkok Bar","done","/2014/06/04/217-bangkok-bar-broughton-street-edinburgh/",0.00,"2014/04/15"],
[1327629876,"Treacle","done","/2014/06/05/218-treacle-broughton-street-edinburgh/",0.00,"2014/04/15"],
[1886873919,"Hemma","done","/2014/06/07/219-hemma-holyrood-road-edinburgh/",0.00,"2014/04/22"],
[70980998,"The Kilderkin","done","/2014/06/07/220-the-kilderkin-canongate-edinburgh/",0.00,"2014/04/22"],
[41973844,"Canons' Gait","done","/2014/06/07/221-the-canons-gait-canongate-edinburgh/",0.00,"2014/04/22"],
[70955003,"Tollbooth Tavern","done","/2014/06/07/222-the-tolbooth-tavern-canongate-edinburgh/",0.00,"2014/04/22"],
[41973861,"White Horse","done","/2014/06/09/223-the-white-horse-canongate-edinburgh/",0.00,"2014/04/22"],
[514064329,"Saint Vincent Bar","done","/2014/06/14/224-the-st-vincent-st-vincent-street-edinburgh/",0.00,"2014/04/29"],
[123329926,"The Raeburn Hotel","done","/2014/06/16/225-the-raeburn-hotel-raeburn-place-edinburgh/",0.00,"2014/04/29"],
[1770134135,"Boteco Do Brasil","done","/2014/06/16/226-boteco-do-brasil-lothian-street-edinburgh/",0.00,"2014/04/29"],
[250351299,"The Royal Oak","done","/2014/06/16/227-the-royal-oak-infirmary-street-edinburgh/",0.00,"2014/04/29"],
[474034784,"Teviot","disqualified:Student union","",0.00,"2014/04/29"],
[1770134134,"Library Bar","disqualified:Student union","",0.00,"2014/04/29"],
[2774743770,"The Victoria Bar & Lounge","done","/2014/06/17/228-the-victoria-bar-lounge-causewayside-edinburgh/",0.00,"2014/04/29"],
[2954633083,"Whistlebinkies","done","/2014/06/19/229-whistlebinkies-niddry-street-edinburgh/",0.00,"2014/05/06"],
[2341263251,"The Globe Bar","done","/2014/06/19/230-the-globe-niddry-street-edinburgh/",0.00,"2014/05/06"],
[2339288044,"Rowantree","disqualified:Private hire/club","",0.00,"2014/05/06"],
[1523647273,"The Caves","disqualified:Private hire/club","",0.00,"2014/05/06"],
[2112358147,"The Crafters Barn","done","/2014/06/21/231-the-crafters-barn-north-bank-street-edinburgh/",0.00,"2014/05/06"],
[2988091597,"Whiski Rooms","done","/2014/06/21/232-whiski-rooms-north-bank-street-edinburgh/",0.00,"2014/05/06"],
[2964238033,"The World's End","done","/2014/06/22/233-worlds-end-high-street-edinburgh/",0.00,"2014/05/13"],
[2426508094,"Blackfriars","disqualified:Closed for refurb when we visited, but we forgot to go back! :(","",0.00,"2014/05/13"],
[2112358193,"Royal McGregor","done","/2014/06/22/234-the-royal-mcgregor-high-street-edinburgh/",0.00,"2014/05/13"],
[2112387184,"North Bridge Brasserie","done","/2014/06/22/235-north-bridge-brasserie-bar-a-k-a-scotsman-hotel-north-bridge-edinburgh/",0.00,"2014/05/13"],
[2858902357,"Sportsters","done","/2014/06/22/236-sportsters-market-street-edinburgh/",0.00,"2014/05/13"],
[1558429123,"The Hebrides","done","/2014/06/22/237-the-herbrides-market-street-edinburgh/",0.00,"2014/05/13"],
[702500249,"Secret Arcade","disqualified:Part of Arcade Bar, closed on our visit","",0.00,"2014/05/20"],
[2871318168,"Arcade Bar","done","/2014/06/23/238-arcade-bar-cockburn-street-edinburgh/",0.00,"2014/05/20"],
[2136096059,"Belushi's","done","/2014/06/23/239-belushis-market-street-edinburgh/",0.00,"2014/05/20"],
[1557683661,"The Castle Arms","done","/2014/06/25/240-the-castle-arms-johnston-terrace-edinburgh/",0.00,"2014/05/20"],
[2338328193,"Finnegan's Wake","done","/2014/06/25/241-finnegans-wake-victoria-street-edinburgh/",0.00,"2014/05/20"],
[1367318907,"Bow Bar","done","/2014/06/26/242-the-bow-bar-victoria-street-edinburgh/",0.00,"2014/05/20"],
[1558008745,"The Black Bull","done","/2014/06/29/243-the-black-bull-leith-street-edinburgh/",0.00,"2014/05/27"],
[2888279093,"Slug & Lettuce","done","/2014/06/30/244-the-slug-and-lettuce-greenside-place-edinburgh/",0.00,"2014/05/27"],
[2121794767,"Playfair","done","/2014/06/30/245-the-playfair-greenside-place-edinburgh/",0.00,"2014/05/27"],
[1369534604,"Pivo","done","/2014/07/01/246-pivo-calton-road-edinburgh/",0.00,"2014/05/27"],
[2110964848,"Waterloo Bar","done","/2014/07/02/247-waterloo-bar-waterloo-place-edinburgh/",0.00,"2014/05/27"],
[2888279094,"The Balmoral Bar","done","/2014/07/03/248-the-balmoral-bar-princes-street-edinburgh/",0.00,"2014/05/27"],
[2697752625,"Beer & Skittles","done","/2014/07/07/249-beer-skittles-picardy-place-edinburgh/",0.00,"2014/06/03"],
[2338469025,"Cafe Habana","done","/2014/07/08/250-cafe-habana-greenside-place-edinburgh/",0.00,"2014/06/03"],
[2333922708,"Clouds & Soil","done","/2014/07/08/251-clouds-soil-picardy-place-edinburgh/",0.00,"2014/06/03"],
[2164008692,"The Place","done","/2014/07/25/252-the-place-york-place-edinburgh/",0.00,"2014/06/03"],
[1710418042,"The Jam House","disqualified:Private hire/club","",0.00,"2014/06/03"],
[1234959188,"All Bar One","done","/2014/07/29/253-all-bar-one-george-street-edinburgh/",0.00,"2014/06/03"],
[2114480005,"Tempus","done","/2014/07/29/254-tempus-george-street-edinburgh/",0.00,"2014/06/10"],
[81125134,"The Dome Bar and Grill","done","/2014/07/31/255-the-dome-george-street-edinburgh/",0.00,"2014/06/10"],
[2153099992,"Madogs","done","/2014/07/31/256-madogs-queen-street-edinburgh/",0.00,"2014/06/10"],
[2100296134,"Opal Lounge","disqualified:Club","",0.00,"2014/06/10"],
[2925698061,"Palm Sugar","done","/2014/08/02/257-palm-sugar-castle-street-edinburgh/",0.00,"2014/06/10"],
[2100296437,"Tigerlily","done","/2014/08/02/258-tigerlily-george-street-edinburgh/",0.00,"2014/06/10"],
[41483829,"1780","done","/2014/08/02/259-1780-rose-street-edinburgh/",0.00,"2014/06/10"],
[42556526,"The GRV","closed:Closed a long time ago","",0.00,"2014/06/10"],
[60320790,"Napier Students' Association","disqualified:Student union","",0.00,"2014/06/10"],
[2812023487,"SkyBar","disqualified:Only open one day per month! Great views of the castle though","",0.00,"2014/06/10"],
[41483851,"The Shack","disqualified:Club","",0.00,"2014/06/10"],
[504319866,"The Meadows Hotel","disqualified:Closed, now a flippin' Sainsbury's!","",0.00,"2014/06/16"],
[2443742582,"10 Wine Bar","done","/2014/08/04/260-10-wine-bar-hill-place-edinburgh/",0.00,"2014/06/17"],
[2957210633,"The Waverley","closed:Closed 'due to accident' since at least 2014/05/13","",0.00,"2014/06/17"],
[2621234519,"Nor Loch","done","/2014/08/10/261-the-nor-loch-waverley-station-edinburgh/",0.00,"2014/06/17"],
[1361026044,"The Banshee Labyrinth","done","/2014/08/11/262-banshee-labyrinth-niddry-street-edinburgh/",0.00,"2014/06/17"],
[2341228729,"Dropkick Murphys","done","/2014/08/12/263-dropkick-murphys-merchant-street-edinburgh/",0.00,"2014/06/17"],
[483044126,"Sneaky Pete's","disqualified:Fee on the door","",0.00,"2014/06/17"],
[483035255,"WJ Christie & Sons","done","/2014/08/17/264-wj-christie-sons-west-port-edinburgh/",0.00,"2014/06/24"],
[2922567339,"Heads & Tales","done","/2014/08/17/265-heads-tales-rutland-place-edinburgh/",0.00,"2014/06/24"],
[2112507655,"Henry's Cellar Bar","done","/2014/08/18/266-henrys-cellar-bar-morrison-street-edinburgh/",0.00,"2014/06/24"],
[2684915194,"The Mad Hatter","done","/2014/08/18/267-the-mad-hatter-torphichen-place-edinburgh/",0.00,"2014/06/24"],
[2868039188,"Platform 5","done","/2014/08/20/268-platform-5-haymarket-terrace-edinburgh/",0.00,"2014/06/24"],
[2382624236,"Pickles","done","/2014/08/21/269-pickles-broughton-street-edinburgh/",0.00,"2014/06/27"],
[2578704906,"The Wee Red Bar","disqualified:Student union","",0.00,"2014/07/01"],
[2925692787,"Juniper","done","",0.00,"2014/07/01"],
[581870354,"Le Monde","done","",0.00,"2014/07/01"],
[2643307267,"Fingers","disqualified:Only open late","",0.00,"2014/07/01"],
[1754796173,"The Amber Rose","done","",0.00,"2014/07/01"],
[2100296461,"Browns","done","",0.00,"2014/07/01"],
[2966042013,"The Hive","disqualified:Club","",0.00,"2014/08/13"],
[2977978100,"The Rabbie Burns","disqualified:Restaurant","",0.00,"2014/08/13"],
[3015271943,"Usher's","disqualified:Opened after the tour was over.","",0.00,"2014/08/13"],
];
