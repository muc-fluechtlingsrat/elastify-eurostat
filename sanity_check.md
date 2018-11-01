# Sanity Check for the numbers
Some corner stones to make sure our plots aren't way off

###  Germany all asylum applications
Should be around 

yearly

Year | bpb | eurostat | our |
-----|-----:|-------:|-----:|
2016 | 747561  | 745155 | 743410|
2012 |  79663  | 77485 | 77035|
2008 |  30026  | 26845 | 26740|
2004 | 52156   | 35605 | 35570 |
2000 | 119648  | 78505 | 75750|
1996 | 151189  | 117335 | 201535|
1992 | 440183  | 438190 | 444420 |
1988 | 105064  | 103075 | 103185|

monthly

Month | bpb | eurostat | our |
-----|-----:|-------:|-----:|
2015 01 | 25042 | 26875 | 26665 |
2016 08 | 91331 | 94350 | 93975 |


Sources: 
- bpb: https://www.bpb.de/politik/innenpolitik/flucht/218788/zahlen-zu-asyl-in-deutschland
- eurostat: 
   - http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_asyctz&lang=en  til 2007
   - http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_asyappctza&lang=en from 2008 on
   - http://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=migr_asyappctzm&lang=en

Remarks: 
- BAMF split Gesamtanträge into Erstanträge and Folgeanträge since 1995
eurostat since 2008
- Giving only the numbers since 2008 produces a misleading picture because of the Jugoslawia war peak in the 90s (cf bpb graphic in the above link)

## Some first check if a run is OK

If we ran e.g. the following command:

   nohup node push_data_citizens_monthly.js 1> month_2.out 2>month_2.err &

1. Check that month_2.err is empty
2. Check that the (number of "got" messages) == (number of "persisted" messages)
 
    grep -wc got month_2.out 
    grep -wc persisted month_2.out 

3. Check that the script looped through all countries of origin
cat month_2.out | egrep -o 'citizen=[A-Z]{2,5}' | sort -u | wc -l
wc -l countryCodes.js

Note: For consistent naming, run

    SCRIPT=push_data_decisions_quarterly.js; nohup node $SCRIPT 1>$(basename $SCRIPT .js)_$(date +%Y%m%d).out 2>$(basename $SCRIPT .js)_$(date +%Y%m%d).err &


