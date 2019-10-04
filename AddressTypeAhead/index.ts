import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as jQuery from 'jquery'
var autocomplete = require('jquery-ui/ui/widgets/autocomplete');
declare var Xrm: any;
 

export class AddressTypeAhead implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Empty constructor.
	 */

    // Reference to ComponentFramework Context object
    private _context: ComponentFramework.Context<IInputs>;

    // PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
    private _notifyOutputChanged: () => void;
	private inputElement: HTMLInputElement; 
	private _addressData :string
    private _address_line_1: string;
    private _container: HTMLDivElement;
    private _refreshData: EventListenerOrEventListenerObject;
    private _state: string;
    private _city: string;
    private _postcode: string; 
    private _country: string;
    private _minCharLength:number=8;
    private _minLength:number;
    private _actionName:string;
    private _subscriptionKey:string ;
    private addresssGeocodeServiceUrlTemplate = 'https://atlas.microsoft.com/search/address/json?typeahead=true&subscription-key={subscriptionKey}&api-version=1.0&query={query}&view=Auto&limit=10';

    constructor() {         
    }

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        // Add control initialization code

        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
        this._address_line_1 = this._context.parameters.name.raw as string;
        this._refreshData = this.refreshData.bind(this);
        this.inputElement = document.createElement("input");
		this.inputElement.setAttribute("id", "search_field");
		//this.inputElement.setAttribute("style","width:300px;border: solid 1px black;");
		this.inputElement.setAttribute("placeholder", "Enter a location");
		this.inputElement.setAttribute("type", "text");		 
		this.inputElement.addEventListener("input", this._refreshData);
		 
		this._container.appendChild(this.inputElement);		
		this._container.setAttribute("style","position:absolute;") ; 
        container = this._container;       
        
    }

    public refreshData(evt: Event): void {

        let inputNumber = this.inputElement.value;
        this._address_line_1 = inputNumber;
        this._city = this._context.parameters.city.raw as string;
        this._state = this._context.parameters.state.raw as string;
        this._postcode = this._context.parameters.zipcode.raw as string;
        this._country = this._context.parameters.country.raw as string;        
        this.GetAddressFinderKeyandContinueCallBack();        
    }


    private PageLoaded(): void {
        //Create a jQuery autocomplete UI widget.
		let addresssGeocodeServiceUrl = this.addresssGeocodeServiceUrlTemplate;
		let minLength:string = this._context.parameters.minlength.raw as string;
        this._minLength = minLength!=null? Number(minLength): this._minCharLength; 
		this._actionName =  this._context.parameters.actionName.raw as string;
		this._subscriptionKey = this._context.parameters.subKey.raw as string;    
        let subKey = this._subscriptionKey;
        let thisRef = this;
        try {

            jQuery("#search_field").autocomplete({
                autoFocus: true,
                appendTo: jQuery("#search_field").parent(),
                minLength: thisRef._minLength,   
                source: function (request: any, response: any) {
                    var street = encodeURIComponent(request.term);

                    var requestObject = {
                        query: street
                    };

                    /*Ajax Call */
                    //Create a URL to the Azure Maps search service to perform the address search.
                    var requestUrl = addresssGeocodeServiceUrl.replace('{query}', encodeURIComponent(request.term))
                        .replace('{subscriptionKey}', subKey)
                        .replace('{language}', 'en-US')
                        .replace('{countrySet}', 'US'); //A comma seperated string of country codes to limit the suggestions to.
                    jQuery.ajax({
                        url: requestUrl,
                        success: function (data) {
                            response(data.results);
                        }
                    });
                    /*Ajax Call End */

                    /*Custom Action Call */
                    // thisRef.getAddressData(requestObject).then(function (result) {

                    //     var subResult = JSON.parse(result);
                    //     var outputResult = subResult.output;
                    //     var results = JSON.parse(outputResult);
                    //     if (!results || results.length == 0) {
                    //         return;
                    //     }

                    //     else
                    //         response(results);

                    // },
                    //     function (error) {
                    //         console.log(error);
                    //     });// JavaScript source code		 
                    /*Custom Action Call End*/
                },                
                select: function (event, ui) {
                    //When a suggestion has been selected.
                    var selectedItem = ui.item;

					/*AJAX CALL CHANGES*/
                    var addresscomponent= selectedItem.address;
                    var address1 = (addresscomponent.streetNumber ? (addresscomponent.streetNumber  + ' ') : '') + (addresscomponent.streetName || '');
                    var addressFormatted = addresscomponent.freeformAddress;
                    thisRef._address_line_1 = address1;					 
                    thisRef._state = addresscomponent.countrySubdivision || '';
                    thisRef._city = addresscomponent.municipality || '';
                    thisRef._country=addresscomponent.countryCodeISO3 || ''
                    thisRef._postcode = addresscomponent.postalCode;
                    thisRef._addressData=addressFormatted;				
					/*AJAX CALL CHANGES END*/

					/*CUSTOM ACTION CHANGES*/
                    // var addresscomponent = selectedItem;
                    // var addressFormatted = selectedItem.FormattedAddress;
                    // var address1 = addresscomponent.StreetNumber === null ? addresscomponent.StreetAddressShort : addresscomponent.StreetNumber + " " + addresscomponent.StreetAddressShort;
                    // thisRef._addressData = addressFormatted;
                    // thisRef._address_line_1 = address1;
                    // thisRef._state = addresscomponent.StateProvinceShort || '';
                    // thisRef._city = addresscomponent.City || '';
                    // thisRef._country = addresscomponent.CountryShort || ''
                    // thisRef._postcode = addresscomponent.PostalCode;
					//thisRef.updateRecord(addresscomponent);
					/*CUSTOM ACTION CHANGES END*/
                    thisRef._notifyOutputChanged();
                    return false;
                }
            })
                .data("ui-autocomplete")._renderItem = (ul: JQuery, item: any): any => {                    
					
					/*AJAX*/
					var suggestionLabel = item.address.freeformAddress;
                    /*Custom Action*/
                    //var suggestionLabel = item.FormattedAddress;
                    return jQuery("<li>").append("<div>" + suggestionLabel + "</div>").appendTo(ul);
                };


        } catch (error) {
            console.log(error);
        }

    }

    private updateRecord(addresscomponent: any): void {

        var address1 = addresscomponent.StreetNumber === null ? addresscomponent.StreetAddressShort : addresscomponent.StreetNumber + " " + addresscomponent.StreetAddressShort;
        let data =
        {
            "address1_line1": address1,
            "address1_city": addresscomponent.City || '',
            "address1_country": addresscomponent.CountryShort || '',
            "address1_stateorprovince": addresscomponent.StateProvinceShort || '',
            "address1_postalcode": addresscomponent.PostalCode
        };

        let contextMode: any = this._context.mode;

        this._context.webAPI.updateRecord(contextMode.contextInfo.entityTypeName, contextMode.contextInfo.entityId, data).then(function success(result) {
            console.log("Record updated");
        }, function (error) {
            console.log("Record update failure" + error.message);
        });

    }

    private async getAddressData(parameters: object): Promise<any> {
        var id = Xrm.Utility.getGlobalContext();
        var req = new XMLHttpRequest();

		var actionName= this._actionName;
        var url: string = (<any>Xrm).Utility.getGlobalContext().getClientUrl();

        return new Promise(function (resolve, reject) {
            req.open("POST", id.getClientUrl() + "/api/data/v9.1/" + actionName, true);
            req.onreadystatechange = function () {
                if (req.readyState !== 4) return;
                if (req.status >= 200 && req.status < 300) {
                    // If successful
                    try {
                        var result = JSON.parse(req.response);
                        if (parseInt(result.StatusCode) < 0) {
                            reject({
                                status: result.StatusCode,
                                statusText: result.StatusMessage
                            });
                        }
                        resolve(req.response);
                    }
                    catch (error) {
                        throw error;
                    }

                } else {
                    // If failed
                    reject({
                        status: req.status,
                        statusText: req.statusText
                    });
                }

            };
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.send(JSON.stringify(parameters));
        });
    }


    public GetAddressFinderKeyandContinueCallBack() {
        this.PageLoaded();
    }

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // // Add code to update control view
        this._context = context;
        this.inputElement.value = this._addressData != null ? this._addressData.toString() : "";  
    }

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
    public getOutputs(): IOutputs {
        return {
            name: this._addressData,
            addressLine1: this._address_line_1,
            city: this._city,
            state: this._state,
            country: this._country,
            zipcode: this._postcode
        }
    }

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
    public destroy(): void {
        // Add code to cleanup control if necessary
        this.inputElement.removeEventListener("input", this._refreshData);
    }
}