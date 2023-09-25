export function mentionToId(mention:string):string {
    const mentionCharactersRegHex = /[\\<>@#&!]/;
    return mention.replace(mentionCharactersRegHex, '');
}

export abstract class WordVariants {
    public static generateVariants(word : string):string[] {
        const frenchAgreementsVerbs = ['er', 'é', 'ée', 'és', 'ées', 'ez'];
        const frenchAgreementsNouns = ['e', 'es'];
        let variants: string[] = [];
        if (!this.hasVariants(word)) { 
            variants.push(word, `${word}s`); 
        } else {
            frenchAgreementsVerbs.forEach(ending => {
                if (word.endsWith(ending)) {
                    variants.push(word);
                    let slicedWord = word.slice(0, word.length - ending.length);
                    frenchAgreementsVerbs.push('e', 'es');
                    frenchAgreementsVerbs.forEach(ending => {
                        if (slicedWord + ending !== word) { variants.push(slicedWord + ending) }
                    });
                }
            });
            frenchAgreementsNouns.forEach(ending => {
                if (word.endsWith(ending)) {
                    variants.push(word);
                    let slicedWord = word.slice(0, word.length - ending.length);
                    frenchAgreementsNouns.forEach(ending => {
                        if (slicedWord + ending !== word) { variants.push(slicedWord + ending) }
                    });
                }
            });
        }
        return variants;
    }
    public static hasVariants(word : string):boolean {
        const frenchAgreement = ['er', 'é', 'ée', 'és', 'ées', 'ez', 'e', 'es']
        let hasVariants: boolean = false;
        frenchAgreement.forEach(ending => {
            if (word.endsWith(ending)) { hasVariants = true; }
        });
        return hasVariants;
    }
}

export abstract class ArrayUtils {
    public static removeElement(array : Array<any>, element : any):Array<any> {
        const index = array.indexOf(element);
        console.log(index);
        if (index > -1) { array.splice(index, 1); }
        return array;
    };
    public static removeElements(array : Array<any>, elements : Array<any>):Array<any> {
        elements.forEach(element => {
            const index = array.indexOf(element);
            if (index > -1) { array.splice(index, 1); }
        });
        return array;
    };
}
