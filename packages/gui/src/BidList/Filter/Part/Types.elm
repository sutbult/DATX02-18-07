module BidList.Filter.Part.Types exposing (..)

import Dict exposing (..)

type alias ElementDict = Dict String Bool

type alias Model =
    { title : String
    , query : String
    , elements : ElementDict
    }

type Msg
    = SetQuery String
    | Toggle String
    | SetCurrencies (List String)

filterList : ElementDict -> List String
filterList = List.map Tuple.first << List.filter Tuple.second << toList
