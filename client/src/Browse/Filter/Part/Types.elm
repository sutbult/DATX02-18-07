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
