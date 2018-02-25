module Browse.Filter.Part.Types exposing (..)

type alias Element =
    { title : String
    , shown : Bool
    }

type alias Model =
    { title : String
    , query : String
    , elements : List Element
    }

type Msg
    = SetQuery String
    | Toggle String
    | SetCurrencies (List String)

filterList : List Element -> List String
filterList = List.map (.title) << List.filter (.shown)
