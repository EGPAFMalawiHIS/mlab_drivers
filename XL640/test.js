const data = "[ '\u00021H|`^&||||||||||P|E 1394-97|20240719144553\rP|1|0|||WESLEY SANGALA|||M||||||||0|0\rO|1|1^01||^^^Na`^^^K`^^^Cl`^^^UREA`^^^CRE|||||||||||SERUM\rR|1|^^^Cl|111.60|mmol/L|^DEFAULT|H|N|F||||20240718155457\rC|1|I|Instrument Flag H\rR|2|^^^CRE|5.08|mg/dL|^DEFAULT|H,HV!|N|F||||20240718160356\rC|1|I|Instrument Flag H,HV!\rR|3|^^^K|4.32|mmol/L|^DEFAULT|N|N|F||||20240718155457\rC|1|I|Instrument Flag N\rR|4|^^^Na|139.40|mmol/L|^DEFAULT|N|N|F||||20240718155457\rC|1|I|Instrument Flag N\rR|5|^^^UREA|56.5|mg/dL|^DEFAULT|H,HV!|N|F||||20240718160347\rC|1|I|Instrument Flag H,HV!\rL|1|N\r\u000348',";

let messages = data.split('\r');
const regex = /\^\^\^(\w+)\|(\d+\.?\d*)\|(\w+\/\w)/;

messages.forEach(line => {
    console.log(line)
    const regex_ = /P\|(\d+)\|0/;

    const match_ = line.match(regex_);
    
    if (match_) {
        console.log(match_[1])
    }else{
        const match = line.match(regex);
  if (match) {
    const [, test, value, unit] = match;
    console.log(`Test: ${test}, Value: ${value}, Unit: ${unit}`);
  }
    }
});