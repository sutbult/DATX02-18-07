module Settings.View exposing
    ( root
    )

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Settings.Types exposing (..)
import Bid.Types exposing
    ( currencyName
    )


root : Model -> Html Msg
root model =
    div []
        [ div []
            [ h1 [class "subtitle"] [text "Blockchain paths"]
            , blockchainPathInputList model.settings.blockchainPathList
            ]
        ]


blockchainPathInputList
    :  List BlockchainPath
    -> Html Msg
blockchainPathInputList blockchainPathList =
    div []
        <| List.map blockchainPathInput blockchainPathList


blockchainPathInput
    :  BlockchainPath
    -> Html Msg
blockchainPathInput blockchainPath =
    div [class "field"]
        [ label [class "label"]
            [ text <| currencyName blockchainPath.currency
            ]
        , div [class "control"]
            [ input
                [ class <| "input"
                , type_ "text"
                , placeholder "default path"
                , value blockchainPath.value
                , onInput (SetBlockchainPath blockchainPath.currency)
                ] []
            ]
        ]
