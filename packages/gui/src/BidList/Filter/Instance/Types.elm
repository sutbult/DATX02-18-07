module BidList.Filter.Instance.Types exposing (..)

import BidList.Filter.Part.Types as PartTypes

type alias Model =
    { name : String
    , from : PartTypes.Model
    , to : PartTypes.Model
    }

type Msg
    = From PartTypes.Msg
    | To PartTypes.Msg
    | SetCurrencies (List String) (List String)
    | SetName String

type alias Filter =
    { from : List String
    , to : List String
    }

getFilter : Model -> Filter
getFilter model = Filter
    (PartTypes.filterList <| (.elements << .from) model)
    (PartTypes.filterList <| (.elements << .to) model)
